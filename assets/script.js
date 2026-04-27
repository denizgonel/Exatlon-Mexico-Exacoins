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
    const rewardButtons = document.querySelector(".reward-buttons");

    const finalUnlock = document.querySelector(".final-unlock");
    const finalButton = document.querySelector(".final-button");
    const passcodeModal = document.querySelector(".passcode-modal");
    const passcodeInput = document.querySelector("#passcodeInput");
    const passcodeMessage = document.querySelector(".passcode-message");
    const keyboardButtons = document.querySelectorAll(".passcode-keyboard button");
    const submitPasscode = document.querySelector(".submit-passcode");
    const closePasscode = document.querySelector(".close-passcode");

    const distance = cardsContainer.scrollWidth - window.innerWidth;
    const buttonHold = 1200;
    const correctPasscode = "exatlon123";
    const downloadFile = "assets/files/surprise-boxes.zip";

    let activeSourceCard = null;
    let floatingCard = null;
    let isOpen = false;
    let isAnimating = false;
    let openState = null;

    function fitCardTitles() {
        const titles = document.querySelectorAll(".mwg_effect001 .card-content h2");

        titles.forEach((title) => {
            title.classList.remove("title-long", "title-extra-long");
            title.style.fontSize = "";

            const textLength = title.textContent.trim().length;

            if (textLength > 28) title.classList.add("title-long");
            if (textLength > 42) title.classList.add("title-extra-long");

            let fontSize = parseFloat(window.getComputedStyle(title).fontSize);
            let lineHeight = parseFloat(window.getComputedStyle(title).lineHeight);

            if (!lineHeight || Number.isNaN(lineHeight)) {
                lineHeight = fontSize * 0.9;
            }

            const maxHeight = lineHeight * 3;

            while (title.scrollHeight > maxHeight && fontSize > 16) {
                fontSize -= 1;
                title.style.fontSize = `${fontSize}px`;

                lineHeight = parseFloat(window.getComputedStyle(title).lineHeight);

                if (!lineHeight || Number.isNaN(lineHeight)) {
                    lineHeight = fontSize * 0.9;
                }
            }
        });
    }

    fitCardTitles();

    gsap.set(rewardButtons, {
        autoAlpha: 0,
        pointerEvents: "none"
    });

    if (finalUnlock) {
        gsap.set(finalUnlock, {
            autoAlpha: 0,
            pointerEvents: "none"
        });
    }

    gsap.timeline({
        scrollTrigger: {
            trigger: container,
            scrub: true,
            start: "top top",
            end: "+=" + buttonHold,
            onEnter: () => {
                rewardButtons.classList.add("is-visible");
                gsap.set(rewardButtons, { pointerEvents: "auto" });
            },
            onLeave: () => {
                rewardButtons.classList.remove("is-visible");
                gsap.set(rewardButtons, { pointerEvents: "none" });
            },
            onEnterBack: () => {
                rewardButtons.classList.add("is-visible");
                gsap.set(rewardButtons, { pointerEvents: "auto" });
            },
            onLeaveBack: () => {
                rewardButtons.classList.remove("is-visible");
                gsap.set(rewardButtons, { pointerEvents: "none" });
            }
        }
    })
    .to(".scroll-wrapper", {
        autoAlpha: 0,
        duration: 0.2
    })
    .to(rewardButtons, {
        autoAlpha: 1,
        duration: 0.3
    })
    .to(rewardButtons, {
        autoAlpha: 1,
        duration: 1.2
    })
    .to(rewardButtons, {
        autoAlpha: 0,
        duration: 0.3
    });

    const scrollTween = gsap.timeline({
        scrollTrigger: {
            trigger: container,
            pin: true,
            scrub: true,
            start: "top top",
            end: "+=" + (distance + buttonHold),
            onUpdate: (self) => {
                if (!finalUnlock) return;

                if (self.progress > 0.985 && !isOpen) {
                    finalUnlock.classList.add("is-visible");
                    gsap.to(finalUnlock, {
                        autoAlpha: 1,
                        duration: 0.25,
                        pointerEvents: "auto"
                    });
                } else {
                    finalUnlock.classList.remove("is-visible");
                    gsap.to(finalUnlock, {
                        autoAlpha: 0,
                        duration: 0.2,
                        pointerEvents: "none"
                    });
                }
            }
        }
    });

    scrollTween
        .to(cardsContainer, {
            x: 0,
            ease: "none",
            duration: buttonHold
        })
        .to(cardsContainer, {
            x: -distance,
            ease: "none",
            duration: distance
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

    function openPasscodeModal() {
        if (!passcodeModal) return;

        passcodeModal.classList.add("is-open");
        passcodeInput.value = "";
        passcodeMessage.textContent = "";
        passcodeInput.focus();
        lenis.stop();
    }

    function closePasscodeModal() {
        if (!passcodeModal) return;

        passcodeModal.classList.remove("is-open");
        passcodeInput.value = "";
        passcodeMessage.textContent = "";
        lenis.start();
    }

    function downloadProtectedFile() {
        const link = document.createElement("a");
        link.href = downloadFile;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function checkPasscode() {
        const value = passcodeInput.value.trim();

        if (value === correctPasscode) {
            passcodeMessage.textContent = "Contraseña correcta. Descargando archivo...";
            passcodeMessage.style.color = "#06402b";
            downloadProtectedFile();
        } else {
            passcodeMessage.textContent = "Contraseña incorrecta.";
            passcodeMessage.style.color = "#c01818";
            passcodeInput.value = "";
        }
    }

    if (finalButton) {
        finalButton.addEventListener("click", openPasscodeModal);
    }

    if (closePasscode) {
        closePasscode.addEventListener("click", closePasscodeModal);
    }

    if (submitPasscode) {
        submitPasscode.addEventListener("click", checkPasscode);
    }

    if (passcodeInput) {
        passcodeInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") checkPasscode();
            if (e.key === "Escape") closePasscodeModal();
        });
    }

    keyboardButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const key = button.textContent.trim();

            if (key === "⌫") {
                passcodeInput.value = passcodeInput.value.slice(0, -1);
            } else {
                passcodeInput.value += key;
            }

            passcodeInput.focus();
        });
    });

    if (passcodeModal) {
        passcodeModal.addEventListener("click", (e) => {
            if (e.target === passcodeModal) {
                closePasscodeModal();
            }
        });
    }

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

        fitCardTitles();

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

        fitCardTitles();

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
        fitCardTitles();
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

            if (floatingCard) {
                floatingCard.addEventListener("click", handleFloatingCardClick);
            }
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

    window.addEventListener("resize", () => {
        fitCardTitles();
        ScrollTrigger.refresh();
    });
});