export default function ScienceBotLogo() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <style>{`
        @keyframes bounceFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          45% { transform: translateY(-16px) rotate(-1.8deg); }
          70% { transform: translateY(-6px) rotate(1.2deg); }
        }

        @keyframes jumpHover {
          0%, 100% { transform: translateY(0) scaleY(1); }
          25% { transform: translateY(-26px) scaleY(1.08); }
          50% { transform: translateY(-8px) scaleY(0.94); }
          75% { transform: translateY(-18px) scaleY(1.04); }
        }

        @keyframes blink {
          0%, 85%, 100% { transform: scaleY(1); }
          88% { transform: scaleY(0.08); }
        }

        @keyframes glassBob {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-7px) rotate(-5deg); }
        }

        @keyframes leverWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(22deg); }
          75% { transform: rotate(-20deg); }
        }

        @keyframes atomSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes atomSpin2 {
          0% { transform: rotate(60deg); }
          100% { transform: rotate(420deg); }
        }

        @keyframes planetRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes orbitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes starTwinkle {
          0%, 100% { opacity: 0.4; transform: scale(0.75); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes bubbleRise {
          0% { transform: translateY(0); opacity: 0.9; }
          100% { transform: translateY(-28px); opacity: 0; }
        }

        @keyframes leafSway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        @keyframes animalBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .bot-g {
          animation: bounceFloat 3.2s ease-in-out infinite;
          transform-origin: 150px 210px;
        }

        .flask {
          animation: glassBob 2.6s ease-in-out infinite;
          transform-origin: 66px 205px;
        }

        .lever {
          animation: leverWiggle 2.1s ease-in-out infinite;
          transform-origin: 234.5px 225px;
        }

        .eye {
          animation: blink 4s ease-in-out infinite;
        }

        .planet {
          animation: planetRotate 20s linear infinite;
        }

        .orbit-elements {
          animation: orbitSpin 25s linear infinite;
        }

        .atom1 {
          animation: atomSpin 8s linear infinite;
        }

        .atom2 {
          animation: atomSpin2 8s linear infinite;
        }

        .star1 { animation: starTwinkle 1.8s ease-in-out infinite; }
        .star2 { animation: starTwinkle 2.3s ease-in-out infinite 0.4s; }
        .star3 { animation: starTwinkle 1.6s ease-in-out infinite 0.9s; }

        .bub1 { animation: bubbleRise 2.1s ease-in-out infinite; }
        .bub2 { animation: bubbleRise 2.1s ease-in-out infinite 0.7s; }
        .bub3 { animation: bubbleRise 2.1s ease-in-out infinite 1.4s; }

        .leaf-sway { animation: leafSway 2.5s ease-in-out infinite; }
        .animal-bounce { animation: animalBounce 2s ease-in-out infinite; }

        .sains-svg:hover .bot-g {
          animation: jumpHover 0.85s ease-in-out infinite;
        }

        .sains-svg:hover .flask {
          animation-duration: 0.7s;
        }

        .sains-svg:hover .lever {
          animation-duration: 0.45s;
        }
      `}</style>

      <svg
        className="sains-svg"
        width="100%"
        viewBox="0 0 300 350"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          cursor: 'pointer',
          display: 'block',
          margin: '0 auto',
          maxWidth: '360px',
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))'
        }}
      >
        {/* Planet di Belakang */}
        <g className="planet" style={{transformOrigin: '150px 175px'}}>
          <circle cx="150" cy="175" r="90" fill="#e8f4ff" opacity="0.3"/>
          <ellipse cx="150" cy="175" rx="110" ry="15" fill="none" stroke="#a8d8ff" strokeWidth="2" opacity="0.4"/>
        </g>

        {/* Elemen Orbit - Science Icons */}
        <g className="orbit-elements" style={{transformOrigin: '150px 175px'}}>
          {/* Tumbuhan - Daun */}
          <g transform="translate(250, 100)">
            <g className="leaf-sway" style={{transformOrigin: '0px 15px'}}>
              <ellipse cx="0" cy="0" rx="8" ry="15" fill="#4ade80" stroke="#1a1a1a" strokeWidth="2"/>
              <path d="M 0 -15 Q 0 0 0 15" stroke="#1a1a1a" strokeWidth="1.5"/>
            </g>
            <circle cx="0" cy="20" r="3" fill="#fbbf24" stroke="#1a1a1a" strokeWidth="1.5"/>
          </g>

          {/* Hewan - Kupu-kupu */}
          <g transform="translate(50, 250)" className="animal-bounce">
            <ellipse cx="-6" cy="0" rx="8" ry="12" fill="#ec4899" stroke="#1a1a1a" strokeWidth="2"/>
            <ellipse cx="6" cy="0" rx="8" ry="12" fill="#ec4899" stroke="#1a1a1a" strokeWidth="2"/>
            <circle cx="-6" cy="-5" r="2" fill="#fff" opacity="0.7"/>
            <circle cx="6" cy="-5" r="2" fill="#fff" opacity="0.7"/>
            <ellipse cx="0" cy="0" rx="2" ry="8" fill="#1a1a1a"/>
            <line x1="0" y1="-8" x2="-3" y2="-12" stroke="#1a1a1a" strokeWidth="1"/>
            <line x1="0" y1="-8" x2="3" y2="-12" stroke="#1a1a1a" strokeWidth="1"/>
          </g>

          {/* Kerangka Tulang */}
          <g transform="translate(240, 250)">
            <circle cx="0" cy="-10" r="6" fill="#fff" stroke="#1a1a1a" strokeWidth="2"/>
            <rect x="-2" y="-4" width="4" height="20" rx="1" fill="#fff" stroke="#1a1a1a" strokeWidth="2"/>
            <line x1="-6" y1="0" x2="6" y2="0" stroke="#1a1a1a" strokeWidth="2"/>
            <line x1="-6" y1="8" x2="6" y2="8" stroke="#1a1a1a" strokeWidth="2"/>
          </g>

          {/* Mikroskop */}
          <g transform="translate(60, 100)">
            <rect x="-8" y="10" width="16" height="3" rx="1" fill="#8b5cf6" stroke="#1a1a1a" strokeWidth="2"/>
            <rect x="-3" y="-5" width="6" height="17" rx="2" fill="#a78bfa" stroke="#1a1a1a" strokeWidth="2"/>
            <circle cx="0" cy="-8" r="5" fill="#3b82f6" opacity="0.6" stroke="#1a1a1a" strokeWidth="2"/>
          </g>
        </g>

        {/* Atom */}
        <g className="atom1" style={{transformOrigin: '240px 90px'}}>
          <ellipse cx="240" cy="90" rx="29" ry="11" fill="none" stroke="#1a1a1a" strokeWidth="2.5" opacity="0.75"/>
        </g>
        <g className="atom2" style={{transformOrigin: '240px 90px'}}>
          <ellipse cx="240" cy="90" rx="29" ry="11" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.55"/>
        </g>
        <circle cx="240" cy="90" r="6.5" fill="#3cd5ff" stroke="#1a1a1a" strokeWidth="2.2"/>
        <circle cx="269" cy="90" r="4" fill="#68ffd4" stroke="#1a1a1a" strokeWidth="2"/>

        {/* Stars */}
        <g className="star1"><polygon points="44,88 46,95 53,95 47,100 49,107 44,102 39,107 41,100 35,95 42,95" fill="#fff" stroke="#1a1a1a" strokeWidth="2"/></g>
        <g className="star2"><polygon points="262,133 264,139 270,139 265,143 267,149 262,145 257,149 259,143 254,139 260,139" fill="#fff" stroke="#1a1a1a" strokeWidth="2"/></g>
        <g className="star3"><polygon points="38,163 40,169 46,169 41,173 43,179 38,175 33,179 35,173 30,169 36,169" fill="#fff" stroke="#1a1a1a" strokeWidth="2"/></g>

        {/* DNA Helix */}
        <g transform="translate(35, 230)">
          <line x1="0" y1="0" x2="0" y2="30" stroke="#10b981" strokeWidth="2"/>
          <line x1="8" y1="0" x2="8" y2="30" stroke="#10b981" strokeWidth="2"/>
          <line x1="0" y1="5" x2="8" y2="5" stroke="#10b981" strokeWidth="1.5"/>
          <line x1="0" y1="15" x2="8" y2="15" stroke="#22d3ee" strokeWidth="1.5"/>
          <line x1="0" y1="25" x2="8" y2="25" stroke="#10b981" strokeWidth="1.5"/>
          <circle cx="0" cy="0" r="2" fill="#10b981"/>
          <circle cx="8" cy="0" r="2" fill="#10b981"/>
          <circle cx="0" cy="30" r="2" fill="#10b981"/>
          <circle cx="8" cy="30" r="2" fill="#10b981"/>
        </g>

        {/* Magnet */}
        <g transform="translate(255, 310)">
          <path d="M -8 0 L -8 12 Q -8 18 0 18 Q 8 18 8 12 L 8 0" fill="none" stroke="#1a1a1a" strokeWidth="2.5"/>
          <rect x="-8" y="0" width="7" height="10" fill="#ff4d4d"/>
          <rect x="1" y="0" width="7" height="10" fill="#3b82f6"/>
        </g>

        {/* Termometer */}
        <g transform="translate(45, 315)">
          <rect x="-2" y="0" width="4" height="20" rx="2" fill="#fff" stroke="#1a1a1a" strokeWidth="2"/>
          <circle cx="0" cy="24" r="4" fill="#ff4d4d" stroke="#1a1a1a" strokeWidth="2"/>
          <rect x="-1" y="12" width="2" height="12" fill="#ff4d4d"/>
          <line x1="-1" y1="5" x2="1" y2="5" stroke="#1a1a1a" strokeWidth="1"/>
          <line x1="-1" y1="10" x2="1" y2="10" stroke="#1a1a1a" strokeWidth="1"/>
          <line x1="-1" y1="15" x2="1" y2="15" stroke="#1a1a1a" strokeWidth="1"/>
        </g>

        {/* Shadow */}
        <ellipse cx="150" cy="280" rx="58" ry="11" fill="#1a1a1a" opacity="0.12"/>

        {/* Flask */}
        <g className="flask">
          <path d="M57 178 L49 210 Q47 230 67 233 Q86 236 86 218 L78 186 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="3.5"/>
          <path d="M55 178 L81 178" stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round"/>
          <rect x="62" y="164" width="13" height="16" rx="4" fill="#ffffff" stroke="#1a1a1a" strokeWidth="2.5"/>
          <path d="M51 216 Q50 230 67 233 Q84 234 85 218 L78 208 Z" fill="#4a9eff" opacity="0.18"/>

          <circle className="bub1" cx="72" cy="212" r="4" fill="none" stroke="#1a1a1a" strokeWidth="1.8"/>
          <circle className="bub2" cx="61" cy="219" r="3.2" fill="none" stroke="#1a1a1a" strokeWidth="1.5"/>
          <circle className="bub3" cx="71" cy="223" r="2.5" fill="none" stroke="#1a1a1a" strokeWidth="1.3"/>
        </g>

        {/* Robot */}
        <g className="bot-g">
          {/* Antena */}
          <line x1="150" y1="88" x2="150" y2="60" stroke="#1a1a1a" strokeWidth="5.5" strokeLinecap="round"/>
          <circle cx="150" cy="54" r="12.5" fill="#ffffff" stroke="#1a1a1a" strokeWidth="4"/>
          <circle cx="150" cy="54" r="6" fill="#ff4d4d"/>

          {/* Badan */}
          <rect x="76" y="90" width="148" height="160" rx="46" fill="#ffffff" stroke="#1a1a1a" strokeWidth="5.5"/>

          {/* Mata */}
          <g className="eye" style={{transformOrigin: '128px 148px'}}>
            {/* <circle cx="128" cy="148" r="19" fill="white" stroke="#1a1a1a" strokeWidth="3.8"/> */}
            <circle cx="128" cy="148" r="10.5" fill="#1a1a1a"/>
            <circle cx="133" cy="143" r="4" fill="white"/>
          </g>

          <g className="eye" style={{transformOrigin: '172px 148px', animationDelay: '0.3s'}}>
            <circle cx="172" cy="148" r="19" fill="white" stroke="#1a1a1a" strokeWidth="3.8"/>
            <circle cx="172" cy="148" r="10.5" fill="#1a1a1a"/>
            <circle cx="177" cy="143" r="4" fill="white"/>
          </g>

          {/* Senyum */}
          <path d="M 125 180 Q 129 205 175 180" stroke="#1a1a1a" strokeWidth="5" fill="none" strokeLinecap="round"/>

          {/* Badge Atom */}
          <g>
            <ellipse cx="150" cy="224" rx="17" ry="8" fill="none" stroke="#1a1a1a" strokeWidth="2.5"/>
            <ellipse cx="149" cy="224" rx="18" ry="8" fill="none" stroke="#1a1a1a" strokeWidth="2" transform="rotate(60 150 225)"/>
            <circle cx="150" cy="225" r="4.5" fill="#1a1a1a"/>
          </g>

          {/* Kaki & Sepatu */}
          <rect x="105" y="248" width="38" height="21" rx="12" fill="#ffffff" stroke="#1a1a1a" strokeWidth="3.5"/>
          <rect x="157" y="248" width="38" height="21" rx="12" fill="#ffffff" stroke="#1a1a1a" strokeWidth="3.5"/>
          {/* <ellipse cx="124" cy="275" rx="25" ry="13.5" fill="#ffffff" stroke="#1a1a1a" strokeWidth="3.5"/>
          <ellipse cx="176" cy="275" rx="25" ry="13.5" fill="#ffffff" stroke="#1a1a1a" strokeWidth="3.5"/> */}
        </g>
      </svg>
    </div>
  );
}
