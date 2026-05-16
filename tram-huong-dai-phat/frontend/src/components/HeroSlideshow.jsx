import { useEffect, useRef, useState } from "react";
import api from "../services/api";

const SLIDE_DURATION = 4000; // 4 giây mỗi slide

function HeroSlideshow() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get("/banners")
      .then((res) => setBanners(res.data.data || []))
      .catch(() => setBanners([]));
  }, []);

  // Auto-play
  useEffect(() => {
    if (banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      goNext();
    }, SLIDE_DURATION);

    return () => clearInterval(timerRef.current);
  }, [banners.length, current]);

  const goTo = (index) => {
    if (animating || index === current) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 700);
    // Reset timer khi click thủ công
    clearInterval(timerRef.current);
  };

  const goNext = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const goPrev = () => {
    goTo((current - 1 + banners.length) % banners.length);
  };

  // Nếu chưa có banner nào → hiển thị hero tĩnh mặc định
  if (banners.length === 0) {
    return (
      <div className="hero-slide-wrap" style={{ position: "relative" }}>
        <div className="hero-slide-bg" style={{
          background: "linear-gradient(135deg, #2d1f16 0%, #4a3520 50%, #7b5b28 100%)",
        }} />
        <div className="hero-slide-overlay" />
        <div className="hero-slide-content">
          <p className="hero-subtitle">Trầm Hương Đại Phát</p>
          <h1>TINH HOA THIÊN NHIÊN,<br />KHỞI ĐẦU BÌNH AN.</h1>
          <p className="hero-desc">
            Khám phá bộ sưu tập vòng tay, nhang trầm và quà tặng trầm hương
            theo phong cách sang trọng, tinh tế và gần gũi thiên nhiên.
          </p>
        </div>
      </div>
    );
  }

  const banner = banners[current];

  return (
    <>
      <style>{`
        .hero-slideshow {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 560px;
          overflow: hidden;
        }

        /* Slide background image */
        .slide-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 0.8s ease, transform 0.8s ease;
          transform: scale(1.04);
          animation: zoomIn 6s ease forwards;
        }
        @keyframes zoomIn {
          from { transform: scale(1.08); }
          to   { transform: scale(1.0); }
        }

        /* Gradient overlay */
        .slide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(20, 12, 5, 0.78) 0%,
            rgba(20, 12, 5, 0.45) 55%,
            rgba(20, 12, 5, 0.15) 100%
          );
        }

        /* Content */
        .slide-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 6vw;
          max-width: 680px;
        }
        .slide-tag {
          color: #c89b3c;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 16px;
          opacity: 0;
          animation: fadeUp 0.7s 0.2s forwards;
        }
        .slide-title {
          color: #ffffff;
          font-size: clamp(28px, 4vw, 52px);
          font-weight: 800;
          line-height: 1.2;
          margin: 0 0 20px;
          opacity: 0;
          animation: fadeUp 0.7s 0.35s forwards;
        }
        .slide-desc {
          color: rgba(255,255,255,0.82);
          font-size: clamp(14px, 1.6vw, 17px);
          line-height: 1.7;
          max-width: 520px;
          margin: 0;
          opacity: 0;
          animation: fadeUp 0.7s 0.5s forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Dot indicators */
        .slide-dots {
          position: absolute;
          bottom: 32px;
          left: 6vw;
          z-index: 3;
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .slide-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.4);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }
        .slide-dot.active {
          width: 28px;
          background: #c89b3c;
        }

        /* Arrow buttons */
        .slide-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.3);
          background: rgba(0,0,0,0.25);
          color: #fff;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(6px);
          transition: all 0.2s;
        }
        .slide-arrow:hover {
          background: rgba(200,155,60,0.7);
          border-color: #c89b3c;
        }
        .slide-arrow.prev { left: 20px; }
        .slide-arrow.next { right: 20px; }

        /* Progress bar */
        .slide-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: #c89b3c;
          animation: progress ${SLIDE_DURATION}ms linear infinite;
          z-index: 3;
        }
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* Slide counter */
        .slide-counter {
          position: absolute;
          bottom: 36px;
          right: 32px;
          z-index: 3;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        @media (max-width: 640px) {
          .slide-arrow { display: none; }
          .slide-content { padding: 0 24px; }
          .hero-slideshow { height: 70vh; min-height: 400px; }
        }
      `}</style>

      <div className="hero-slideshow">
        {/* Background image */}
        <div
          key={banner.id}
          className="slide-bg"
          style={{ backgroundImage: `url(${banner.image_url})` }}
        />

        {/* Overlay */}
        <div className="slide-overlay" />

        {/* Content */}
        <div className="slide-content" key={`content-${banner.id}`}>
          <p className="slide-tag">Trầm Hương Đại Phát</p>
          <h1 className="slide-title">{banner.title}</h1>
          {banner.description && (
            <p className="slide-desc">{banner.description}</p>
          )}
        </div>

        {/* Prev / Next arrows */}
        {banners.length > 1 && (
          <>
            <button className="slide-arrow prev" onClick={goPrev}>‹</button>
            <button className="slide-arrow next" onClick={goNext}>›</button>
          </>
        )}

        {/* Dot indicators */}
        {banners.length > 1 && (
          <div className="slide-dots">
            {banners.map((_, i) => (
              <button
                key={i}
                className={`slide-dot ${i === current ? "active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        {banners.length > 1 && (
          <div className="slide-counter">
            {String(current + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
          </div>
        )}

        {/* Progress bar */}
        {banners.length > 1 && (
          <div key={`prog-${current}`} className="slide-progress" />
        )}
      </div>
    </>
  );
}

export default HeroSlideshow;
