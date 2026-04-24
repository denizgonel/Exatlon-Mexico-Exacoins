gsap.registerPlugin(ScrollTrigger);

window.addEventListener("DOMContentLoaded", () => {
    const lenis = new Lenis({
        autoRaf: true,
    });

    const container = document.querySelector(".mwg_effect001 .container");
    const cardsContainer = container.querySelector(".cards");
    const cards = document.querySelectorAll(".card");
    const backdrop = document.querySelector(".card-backdrop");
    const viewer = document.querySelector(".card-viewer");

    const distance = cardsContainer.scrollWidth - window.innerWidth;

    let activeSourceCard = null;
    let floatingCard = null;
    let isOpen = false;
    let isAnimating = false;
    let openState = null;

    gsap.to(".scroll-wrapper", {
        autoAlpha: 0,
        duration: 0.2,
        scrollTrigger: {
            trigger: cardsContainer,
            start: "top top",
            end: "top top-=1",
            toggleActions: "play none reverse none"
        }
    });

    const scrollTween = gsap.to(cardsContainer, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
            trigger: container,
            pin: true,
            scrub: true,
            start: "top top",
            end: "+=" + distance
        }
    });

    cards.forEach((card) => {
        const values = {
            x: (Math.random() * 20 + 30) * (Math.random() < 0.5 ? 1 : -1),
            y: (Math.random() * 6 + 10) * (Math.random() < 0.5 ? 1 : -1),
            rotation: (Math.random() * 10 + 10) * (Math.random() < 0.5 ? 1 : -1)
        };

        gsap.fromTo(card, {
            rotation: values.rotation,
            xPercent: values.x,
            yPercent: values.y
        }, {
            rotation: -values.rotation,
            xPercent: -values.x,
            yPercent: -values.y,
            ease: "none",
            scrollTrigger: {
                trigger: card,
                containerAnimation: scrollTween,
                start: "left 120%",
                end: "right -20%",
                scrub: true,
            }
        });
    });

    function getSourceRect(card) {
        return card.querySelector(".card-inner").getBoundingClientRect();
    }

    function getCardRotation(card) {
        const transform = getComputedStyle(card).transform;

        if (!transform || transform === "none") return 0;

        const values = transform.match(/matrix\(([^)]+)\)/);
        if (!values) return 0;

        const parts = values[1].split(",").map(Number);
        const a = parts[0];
        const b = parts[1];

        return Math.atan2(b, a) * (180 / Math.PI);
    }

    function buildFloatingCard(card) {
        const clone = card.cloneNode(true);
        clone.classList.add("floating-card");

        const sourceInner = card.querySelector(".card-inner");
        const cloneInner = clone.querySelector(".card-inner");
        const sourceCardStyles = getComputedStyle(card);
        const sourceInnerStyles = getComputedStyle(sourceInner);
        const rect = sourceInner.getBoundingClientRect();

        clone.style.color = sourceCardStyles.color;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.borderRadius = sourceInnerStyles.borderRadius;

        cloneInner.style.borderWidth = sourceInnerStyles.borderWidth;
        cloneInner.style.borderStyle = sourceInnerStyles.borderStyle;
        cloneInner.style.borderColor = sourceInnerStyles.borderColor;
        cloneInner.style.borderRadius = sourceInnerStyles.borderRadius;

        return clone;
    }

    function calculateTargetRect() {
        const maxViewportHeight = window.innerHeight * 0.92;
        const maxViewportWidth = window.innerWidth * 0.92;
        const aspectRatio = 0.75;

        let height = maxViewportHeight;
        let width = height * aspectRatio;

        if (width > maxViewportWidth) {
            width = maxViewportWidth;
            height = width / aspectRatio;
        }

        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        return { left, top, width, height };
    }

    function openCard(card) {
        if (isOpen || isAnimating) return;

        const sourceRect = getSourceRect(card);
        const targetRect = calculateTargetRect();
        const sourceRotation = getCardRotation(card);

        activeSourceCard = card;
        floatingCard = buildFloatingCard(card);
        viewer.innerHTML = "";
        viewer.appendChild(floatingCard);

        const scaleX = targetRect.width / sourceRect.width;
        const scaleY = targetRect.height / sourceRect.height;
        const deltaX = targetRect.left - sourceRect.left;
        const deltaY = targetRect.top - sourceRect.top;

        gsap.set(floatingCard, {
            x: sourceRect.left,
            y: sourceRect.top,
            scaleX: 1,
            scaleY: 1,
            rotation: sourceRotation,
            transformOrigin: "top left",
            force3D: true
        });

        openState = {
            sourceRect,
            targetRect,
            sourceRotation
        };

        activeSourceCard.classList.add("is-source-hidden");
        document.body.classList.add("card-open");
        isAnimating = true;

        lenis.stop();

        gsap.to(backdrop, {
            opacity: 1,
            duration: 0.16,
            ease: "power2.out",
            onStart: () => {
                backdrop.style.pointerEvents = "auto";
            }
        });

        gsap.to(floatingCard, {
            x: sourceRect.left + deltaX,
            y: sourceRect.top + deltaY,
            scaleX,
            scaleY,
            rotation: 0,
            duration: 0.55,
            ease: "expo.out",
            force3D: true,
            overwrite: true,
            onComplete: () => {
                isAnimating = false;
                isOpen = true;
            }
        });
    }

    function cleanupOpenState() {
        if (floatingCard) {
            floatingCard.removeEventListener("click", handleFloatingCardClick);
        }

        if (activeSourceCard) {
            activeSourceCard.classList.remove("is-source-hidden");
        }

        viewer.innerHTML = "";
        floatingCard = null;
        activeSourceCard = null;
        openState = null;
        isOpen = false;
        isAnimating = false;
        document.body.classList.remove("card-open");
        backdrop.style.pointerEvents = "none";

        lenis.start();
    }

    function closeCard() {
        if (!isOpen || isAnimating || !floatingCard || !openState) return;

        isAnimating = true;

        gsap.to(backdrop, {
            opacity: 0,
            duration: 0.14,
            ease: "power2.out",
            onComplete: () => {
                backdrop.style.pointerEvents = "none";
            }
        });

        gsap.to(floatingCard, {
            x: openState.sourceRect.left,
            y: openState.sourceRect.top,
            scaleX: 1,
            scaleY: 1,
            rotation: openState.sourceRotation,
            duration: 0.45,
            ease: "expo.inOut",
            force3D: true,
            overwrite: true,
            onComplete: cleanupOpenState
        });
    }

    function handleFloatingCardClick(e) {
        e.preventDefault();
        e.stopPropagation();
        closeCard();
    }

    cards.forEach((card) => {
        card.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (isAnimating || isOpen) return;
            openCard(card);
        });
    });

    backdrop.addEventListener("click", () => {
        if (isOpen && !isAnimating) {
            closeCard();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen && !isAnimating) {
            closeCard();
        }
    });
});