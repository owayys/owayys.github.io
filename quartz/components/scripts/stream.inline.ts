let streamObserver: IntersectionObserver | null = null

function setupStreamPagination() {
  if (streamObserver) {
    streamObserver.disconnect()
    streamObserver = null
  }

  const list = document.querySelector(".stream-list") as HTMLElement | null
  const sentinel = document.querySelector(".stream-sentinel") as HTMLElement | null
  if (!list || !sentinel) {
    return
  }

  const batchSize = parseInt(list.dataset.batchSize ?? "15", 10)

  const revealNextBatch = () => {
    const hidden = list.querySelectorAll(".stream-item.stream-hidden")
    for (let i = 0; i < batchSize && i < hidden.length; i++) {
      hidden[i].classList.remove("stream-hidden")
    }

    if (list.querySelectorAll(".stream-item.stream-hidden").length === 0) {
      streamObserver?.disconnect()
      streamObserver = null
      sentinel.style.display = "none"
    }
  }

  streamObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        revealNextBatch()
      }
    },
    { rootMargin: "200px" },
  )

  streamObserver.observe(sentinel)
}

document.addEventListener("nav", () => {
  setupStreamPagination()
})
