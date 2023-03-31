import { browser } from 'webextension-polyfill-ts'
import './styles.scss'


const issueUrl = /https:\/\/gitlab\.com\/.*\/-\/issues\/(\d+)/

var isMounted: boolean = false

const commentsSide = `<div id="sidebar__container">
    
        </div>`

const initSidebarButton = () => {
    const button = document.createElement('button')
    button.classList.add('btn__custom')
    const img = document.createElement('img')
    img.src = browser.runtime.getURL('assets/icons/tool.png')
    img.classList.add('avatar', 'avatar-tile', 's32')

    button.appendChild(img)
    button.addEventListener('click', toggleSidebar)

    const sidebar = document.querySelector('#sidebar__container')
    const parent = sidebar.parentElement
    parent.insertBefore(button, sidebar)
    sidebar.classList.toggle('hidden')
}

const toggleSidebar = () => {
    const sideBar = document.querySelector('#sidebar__container')
    sideBar.classList.toggle('hidden')
}

const scrollToComment = (e: Element) => {
    const rect = e.getBoundingClientRect()
    window.scroll({
        top: rect.top + window.scrollY - 100,
        behavior: 'smooth'
    })
}

const sortCommentsByThumbsup = () => {
    const comments = Array.from(document.querySelectorAll('#sidebar__container > div'))

    comments.sort((a, b) => {
        const counterA = parseInt(a.querySelector('.js-counter')?.textContent)
        const counterB = parseInt(b.querySelector('.js-counter')?.textContent)

        if (counterA && counterB) return counterB - counterA
    })

    document.querySelector('#sidebar__container').innerHTML = ''

    comments.forEach((comment) => {
        document.querySelector('#sidebar__container').appendChild(comment)
    })
}

        
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            const elem = node as HTMLElement
            if (!elem.tagName) return
            if (elem) {
                var commentsNode = elem.querySelectorAll('.timeline-discussion-body .note-text')
                if (commentsNode.length <= 0) {
                    return
                }
                commentsNode.forEach((comment) => {
                    if (comment.textContent !== undefined) {
                        const sidebarContainer = document.querySelector('#sidebar__container')

                        const clone = comment.closest('.timeline-content').cloneNode(true) as HTMLElement
                        const usernameClone = clone.querySelector('.author-username-link').firstChild.cloneNode(true)
                        const commentClone = clone.querySelector('.note-text').firstChild.cloneNode(true)

                        const glEmoji = clone.querySelector('.timeline-content gl-emoji')
                        if (glEmoji === null) return
                        const emojiName = glEmoji.getAttribute('data-name')
                
                        if (emojiName === "thumbsup") {
                            const counter = clone.querySelector('.js-counter').textContent
                            if (parseInt(counter) > 0) {
                                const newDiv = document.createElement('div')
                                newDiv.appendChild(usernameClone)
                                newDiv.appendChild(commentClone)
                                newDiv.appendChild(glEmoji.parentNode.parentNode)
                                sidebarContainer.appendChild(newDiv)

                                newDiv.addEventListener('click', () => {
                                    if (!comment.parentNode.querySelector('#back__button')) {
                                        const jumpBack = document.createElement('button')
                                        jumpBack.id = 'back__button'
                                        jumpBack.classList.add('btn', 'gl-mr-3', 'gl-my-2', 'btn-default', 'btn-md', 'gl-button', 'gl-ml-3')
                                        jumpBack.textContent = 'Jump back'
                                        jumpBack.addEventListener('click', () => {
                                            scrollToComment(newDiv)
                                        })
                                        const jumpBackTarget = comment.parentNode.querySelector('.note-awards').firstChild
                                        jumpBackTarget.appendChild(jumpBack)
                                    }
                                    scrollToComment(comment)
                                })
                            }
                        }
                    }
                })
            }
        })
    })
    sortCommentsByThumbsup()
})

browser.runtime.onMessage.addListener(request => {
    if (issueUrl.test(request.url)) {
        const sideBar = document.querySelector('.container-fluid.container-limited.project-highlight-puc')

        if (!isMounted) {
            sideBar.insertAdjacentHTML('beforebegin', commentsSide)
            isMounted = true
            initSidebarButton()
        }

        var parentElement = document.querySelector('#notes-list')
        observer.observe(parentElement, { childList: true })
    }
})

export { };