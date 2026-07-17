/** Decorative contour lines in the top-left / bottom-right screen corners. */
export function AuthBackgroundWaves() {
  return (
    <div className="auth-waves-layer" aria-hidden>
      <div className="auth-waves auth-waves--top-left">
        {/* Bands trace one line out and the next one back, so every closing
            segment falls outside the viewport and never shows as a hard edge. */}
        <svg viewBox="0 0 400 700" preserveAspectRatio="none">
          <path
            className="auth-waves__band auth-waves__band--deep"
            d="M265 -40 C300 130, 15 150, 30 380 C40 530, -55 580, -95 670 L-40 690 C0 610, 100 540, 90 390 C80 180, 360 140, 320 -40 Z"
          />
          <path
            className="auth-waves__band"
            d="M320 -40 C360 140, 80 180, 90 390 C100 540, 0 610, -40 690 L10 710 C55 640, 155 550, 150 400 C145 210, 410 150, 375 -40 Z"
          />
          <path className="auth-waves__line" d="M265 -40 C300 130, 15 150, 30 380 C40 530, -55 580, -95 670" />
          <path className="auth-waves__line" d="M320 -40 C360 140, 80 180, 90 390 C100 540, 0 610, -40 690" />
          <path className="auth-waves__line" d="M375 -40 C410 150, 145 210, 150 400 C155 550, 55 640, 10 710" />
        </svg>
      </div>
      <div className="auth-waves auth-waves--bottom-right">
        <svg viewBox="0 0 400 700" preserveAspectRatio="none">
          <path
            className="auth-waves__band auth-waves__band--deep"
            d="M410 -50 C200 20, 290 250, 130 340 C20 400, 70 570, -70 650 L-30 690 C110 610, 60 455, 170 390 C340 290, 240 80, 440 10 Z"
          />
          <path
            className="auth-waves__band"
            d="M440 10 C240 80, 340 290, 170 390 C60 455, 110 610, -30 690 L10 730 C150 650, 100 510, 210 440 C390 330, 280 140, 470 70 Z"
          />
          <path className="auth-waves__line" d="M410 -50 C200 20, 290 250, 130 340 C20 400, 70 570, -70 650" />
          <path className="auth-waves__line" d="M440 10 C240 80, 340 290, 170 390 C60 455, 110 610, -30 690" />
          <path className="auth-waves__line" d="M470 70 C280 140, 390 330, 210 440 C100 510, 150 650, 10 730" />
        </svg>
      </div>
    </div>
  );
}
