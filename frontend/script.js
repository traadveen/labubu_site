// Function to move the slider forward
function nextSlide(trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;

    const slides = Array.from(track.children);
    const slideWidth = slides[0].offsetWidth;
    const slideMargin = slides.length > 1 ? parseFloat(getComputedStyle(slides[1]).marginRight) : 0;
    const totalSlideWidth = slideWidth + slideMargin;

    const currentPosition = parseFloat(track.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    let newPosition = currentPosition - totalSlideWidth;

    track.style.transform = `translateX(${newPosition}px)`;

    // Check if the slider has moved to the duplicated slides at the end
    if (Math.abs(newPosition) >= (slides.length - 2) * totalSlideWidth) {
        // Reset the position to the beginning without a visual transition
        setTimeout(() => {
            track.style.transition = 'none'; // Disable transition
            track.style.transform = `translateX(${-2 * totalSlideWidth}px)`;
            setTimeout(() => {
                track.style.transition = 'transform 0.5s ease-in-out'; // Re-enable transition
            }, 50);
        }, 550); // Увеличьте задержку, чтобы анимация в 0.5s успела завершиться
    }
}

// Function to move the slider backward
function prevSlide(trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;

    const slides = Array.from(track.children);
    const slideWidth = slides[0].offsetWidth;
    const slideMargin = slides.length > 1 ? parseFloat(getComputedStyle(slides[1]).marginRight) : 0;
    const totalSlideWidth = slideWidth + slideMargin;

    const currentPosition = parseFloat(track.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    let newPosition = currentPosition + totalSlideWidth;

    track.style.transform = `translateX(${newPosition}px)`;

    // Check if the slider has moved to the duplicated slides at the beginning
    if (newPosition >= 0) {
        // Reset the position to the end without a visual transition
        setTimeout(() => {
            track.style.transition = 'none'; // Disable transition
            track.style.transform = `translateX(${-(slides.length - 3) * totalSlideWidth}px)`;
            setTimeout(() => {
                track.style.transition = 'transform 0.5s ease-in-out'; // Re-enable transition
            }, 50);
        }, 550); // Увеличьте задержку
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Set initial position for both sliders
    const galleryTrack = document.getElementById('galleryTrack');
    const reviewsTrack = document.getElementById('reviewsTrack');

    if (galleryTrack) {
        const slides = Array.from(galleryTrack.children);
        const totalSlideWidth = slides[0].offsetWidth + (slides.length > 1 ? parseFloat(getComputedStyle(slides[1]).marginRight) : 0);
        galleryTrack.style.transform = `translateX(${-2 * totalSlideWidth}px)`;
    }

    if (reviewsTrack) {
        const slides = Array.from(reviewsTrack.children);
        const totalSlideWidth = slides[0].offsetWidth + (slides.length > 1 ? parseFloat(getComputedStyle(slides[1]).marginRight) : 0);
        reviewsTrack.style.transform = `translateX(${-2 * totalSlideWidth}px)`;
    }

    // ==================================
    // ОБРАБОТКА ФОРМЫ ЗАКАЗА
    // ==================================
    const orderForm = document.getElementById("orderForm");
    if (orderForm) {
        orderForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = {
                name: orderForm.name?.value || "",
                phone: orderForm.phone?.value || "",
                date: orderForm.date?.value || "",
                time: orderForm.time?.value || "",
                comment: orderForm.comment?.value || "",
            };

            if (!formData.phone.trim()) {
                alert("Пожалуйста, укажите номер телефона!");
                return;
            }

            try {
                const response = await fetch("/api/order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    alert("Спасибо! Ваша заявка отправлена ✅");
                    orderForm.reset();
                } else {
                    const errorData = await response.json();
                    alert("Ошибка при отправке: " + (errorData.detail || "Попробуйте позже."));
                }
            } catch (err) {
                console.error("Ошибка при отправке формы:", err);
                alert("⚠️ Произошла ошибка соединения с сервером. Пожалуйста, попробуйте позже.");
            }
        });
    }
});
