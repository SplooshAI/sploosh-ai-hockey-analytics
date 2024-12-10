import * as React from "react";

interface NHLEdgeHockeyRinkProps {
  className?: string;
  awayTeamName?: string;
  homeTeamName?: string;
  centerIceLogo?: string;
  centerIceLogoHeight?: number;
  centerIceLogoWidth?: number;
  iceTexturePattern?: string;
  zamboniImage?: string;
  displayZamboni?: boolean;
}

const DEFAULT_CENTER_ICE_LOGO_SEATTLE_KRAKEN_LIGHT = "https://assets.nhle.com/logos/nhl/svg/SEA_light.svg"
const DEFAULT_ICE_TEXTURE_PATTERN_URL = "https://wsr.nhle.com/static/js/../images/f7597e93d3f2a4b23d41.png"
const DEFAULT_ZAMBONI_IMAGE = "data:image/png;base64,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"

const NHLEdgeHockeyRink = ({
  awayTeamName = "",
  homeTeamName = "",
  centerIceLogo = DEFAULT_CENTER_ICE_LOGO_SEATTLE_KRAKEN_LIGHT,
  centerIceLogoHeight = 400,
  centerIceLogoWidth = 400,
  className = "w-full h-auto",
  iceTexturePattern = DEFAULT_ICE_TEXTURE_PATTERN_URL,
  zamboniImage = DEFAULT_ZAMBONI_IMAGE,
  displayZamboni = false
}: NHLEdgeHockeyRinkProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="-75 -75 2550 1170"
    className={className}
  >
    <g>
      <path
        fill="#FFFFFF"
        d="M2064,1020H336C151.2,1020,0,868.8,0,684V336C0,151.2,151.2,0,336,0h1728c184.8,0,336,151.2,336,336v348 C2400,868.8,2248.8,1020,2064,1020z"
      />
      <path
        d="M2064,1020H336C151.2,1020,0,868.8,0,684V336C0,151.2,151.2,0,336,0h1728c184.8,0,336,151.2,336,336v348 C2400,868.8,2248.8,1020,2064,1020z"
        fill="url(#ice)"
        className="sc-kfneYu iQZBWB"
      />
      <clipPath id="rinkBorderClip">
        <path
          d="M2064,1020H336C151.2,1020,0,868.8,0,684V336C0,151.2,151.2,0,336,0h1728c184.8,0,336,151.2,336,336v348 C2400,868.8,2248.8,1020,2064,1020z"
          className="sc-kfneYu iQZBWB"
        />
      </clipPath>
    </g>
    <defs>
      <pattern
        id="ice"
        patternContentUnits="userSpaceOnUse"
        width={1}
        height={1}
      >
        <image
          href={iceTexturePattern}
          x={-100}
          y={-100}
          height={1220}
          width={2600}
        />
      </pattern>
    </defs>
    <image
      href={centerIceLogo}
      height={centerIceLogoHeight}
      width={centerIceLogoWidth}
      x={1000}
      y={310}
    />
    <text
      x={510}
      y={-25}
      textAnchor="middle"
      transform="rotate(90)"
      className="sc-iSfqCo cLdcJN"
    >
      {awayTeamName}
    </text>
    <text
      x={-510}
      y={2375}
      textAnchor="middle"
      transform="rotate(270)"
      className="sc-iSfqCo fInzJJ"
    >
      {homeTeamName}
    </text>
    <rect x={1194} width={12} height={1020} className="sc-hZlppA eaOGAc" />
    <g>
      <path
        fill="#3366CC"
        d="M1200,332c24.03,0,47.34,4.71,69.29,13.99c21.2,8.97,40.23,21.8,56.58,38.15 c16.35,16.35,29.18,35.38,38.15,56.58c9.28,21.94,13.99,45.25,13.99,69.29s-4.71,47.34-13.99,69.28 c-8.97,21.2-21.8,40.23-38.15,56.58s-35.38,29.18-56.58,38.15c-21.94,9.28-45.25,13.99-69.29,13.99s-47.34-4.71-69.29-13.99 c-21.2-8.97-40.23-21.8-56.58-38.15s-29.18-35.38-38.15-56.58c-9.28-21.94-13.99-45.25-13.99-69.28s4.71-47.34,13.99-69.29 c8.97-21.2,21.8-40.23,38.15-56.58c16.35-16.35,35.38-29.18,56.58-38.15C1152.66,336.71,1175.97,332,1200,332 M1200,330 c-99.41,0-180,80.59-180,180s80.59,180,180,180s180-80.59,180-180S1299.41,330,1200,330L1200,330z"
      />
    </g>
    <g>
      <rect x={888} fill="#3366CC" width={12} height={1020} />
    </g>
    <g>
      <rect x={1500} fill="#3366CC" width={12} height={1020} />
    </g>
    <g>
      <path
        fill="none"
        d="M1200,962c-31.98,0-58,26.02-58,58h116C1258,988.02,1231.98,962,1200,962z"
      />
      <path
        fill="#CC3333"
        d="M1200,962c31.98,0,58,26.02,58,58h2c0-33.14-26.86-60-60-60s-60,26.86-60,60h2 C1142,988.02,1168.02,962,1200,962z"
      />
    </g>
    <g>
      <rect x={1196} fill="#FFFFFF" width={8} height={8} />
      <path
        fill="#FFFFFF"
        d="M1204,983.78h-8v-16.13h8V983.78z M1204,939.42h-8v-16.13h8V939.42z M1204,895.07h-8v-16.13h8V895.07z M1204,850.71h-8v-16.13h8V850.71z M1204,806.36h-8v-16.13h8V806.36z M1204,762.01h-8v-16.13h8V762.01z M1204,717.66h-8v-16.13h8 V717.66z M1204,673.3h-8v-16.13h8V673.3z M1204,628.95h-8v-16.13h8V628.95z M1204,584.59h-8v-16.13h8V584.59z M1204,540.24h-8 v-16.13h8V540.24z M1204,495.89h-8v-16.13h8V495.89z M1204,451.53h-8v-16.13h8V451.53z M1204,407.18h-8v-16.13h8V407.18z M1204,362.83h-8V346.7h8V362.83z M1204,318.47h-8v-16.13h8V318.47z M1204,274.12h-8v-16.13h8V274.12z M1204,229.77h-8v-16.13h8 V229.77z M1204,185.41h-8v-16.13h8V185.41z M1204,141.06h-8v-16.13h8V141.06z M1204,96.71h-8V80.58h8V96.71z M1204,52.35h-8V36.23 h8V52.35z"
      />
      <rect x={1196} y={1012} fill="#FFFFFF" width={8} height={8} />
    </g>
    <g>
      <g>
        <g>
          <circle fill="none" cx={372} cy={246} r={180} />
          <path
            fill="#CC3333"
            d="M372,68c24.03,0,47.34,4.71,69.29,13.99c21.2,8.97,40.23,21.8,56.58,38.15s29.18,35.38,38.15,56.58 C545.29,198.66,550,221.97,550,246s-4.71,47.34-13.99,69.29c-8.97,21.2-21.8,40.23-38.15,56.58 c-16.35,16.35-35.38,29.18-56.58,38.15C419.34,419.29,396.03,424,372,424s-47.34-4.71-69.29-13.99 c-21.2-8.97-40.23-21.8-56.58-38.15c-16.35-16.35-29.18-35.38-38.15-56.58C198.71,293.34,194,270.03,194,246 s4.71-47.34,13.99-69.29c8.97-21.2,21.8-40.23,38.15-56.58c16.35-16.35,35.38-29.18,56.58-38.15C324.66,72.71,347.97,68,372,68 M372,66 c-99.41,0-180,80.59-180,180s80.59,180,180,180s180-80.59,180-180S471.41,66,372,66L372,66z"
          />
        </g>
        <path
          fill="#CC3333"
          d="M372,236c5.51,0,10,4.49,10,10s-4.49,10-10,10s-10-4.49-10-10S366.49,236,372,236 M372,234 c-6.63,0-12,5.37-12,12s5.37,12,12,12s12-5.37,12-12S378.63,234,372,234L372,234z"
        />
        <g>
          <rect
            x={329}
            y={218}
            transform="matrix(6.123234e-17 -1 1 6.123234e-17 128 566)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={300} y={235} fill="#CC3333" width={48} height={2} />
          <rect
            x={329}
            y={272}
            transform="matrix(-1.836970e-16 1 -1 -1.836970e-16 620 -74)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={300} y={255} fill="#CC3333" width={48} height={2} />
        </g>
        <g>
          <rect
            x={379}
            y={218}
            transform="matrix(4.489393e-11 -1 1 4.489393e-11 178 616)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={396} y={235} fill="#CC3333" width={48} height={2} />
          <rect
            x={379}
            y={272}
            transform="matrix(-4.489405e-11 1 -1 -4.489405e-11 670 -124)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={396} y={255} fill="#CC3333" width={48} height={2} />
        </g>
        <polygon fill="#CC3333" points="339,69 337,70 337,45 339,45  " />
        <polygon fill="#CC3333" points="407,70 405,69 405,45 407,45  " />
        <polygon fill="#CC3333" points="339,423 337,422 337,447 339,447  " />
        <polygon fill="#CC3333" points="407,422 405,423 405,447 407,447  " />
      </g>
      <g>
        <path
          fill="none"
          d="M379,236.27v19.47c3.02-2.18,5-5.72,5-9.73C384,241.99,382.02,238.45,379,236.27z"
        />
        <path
          fill="none"
          d="M372,234c-2.45,0-4.73,0.74-6.63,2h13.26C376.73,234.74,374.45,234,372,234z"
        />
        <path
          fill="none"
          d="M372,258c2.45,0,4.73-0.74,6.63-2h-13.26C367.27,257.26,369.55,258,372,258z"
        />
        <path
          fill="none"
          d="M360,246c0,4.01,1.98,7.55,5,9.73v-19.47C361.98,238.45,360,241.99,360,246z"
        />
        <path
          fill="#CC3333"
          d="M378.63,236h-13.26c-0.13,0.08-0.25,1.18-1.37,1.27v17.47c1.12,0.09,1.24,1.18,1.37,1.27h13.26 c0.13-0.08,0.25-1.18,1.37-1.27v-17.47C378.88,237.18,378.76,236.08,378.63,236z"
        />
      </g>
    </g>
    <g>
      <g>
        <circle fill="none" cx={372} cy={774} r={180} />
        <path
          fill="#CC3333"
          d="M552,774c0-87.43-62.34-160.3-145-176.59V573h-2v24l0.09,0.05C394.37,595.05,383.31,594,372,594 s-22.37,1.05-33.09,3.05L339,597v-24h-2v24.41C254.34,613.7,192,686.57,192,774s62.34,160.3,145,176.59V975h2v-24l-0.09-0.05 c10.73,1.99,21.79,3.05,33.09,3.05s22.37-1.05,33.09-3.05L405,951v24h2v-24.41C489.66,934.3,552,861.43,552,774z M441.29,938.01 C419.34,947.29,396.03,952,372,952s-47.34-4.71-69.28-13.99c-21.2-8.97-40.23-21.8-56.58-38.15s-29.18-35.38-38.15-56.58 C198.71,821.34,194,798.03,194,774s4.71-47.34,13.99-69.29c8.97-21.2,21.8-40.23,38.15-56.58c16.35-16.35,35.38-29.18,56.58-38.15 C324.66,600.71,347.97,596,372,596s47.34,4.71,69.29,13.99c21.2,8.97,40.23,21.8,56.58,38.15c16.35,16.35,29.18,35.38,38.15,56.58 C545.29,726.66,550,749.97,550,774s-4.71,47.34-13.99,69.28c-8.97,21.2-21.8,40.23-38.15,56.58S462.48,929.05,441.29,938.01z"
        />
      </g>
      <g>
        <path
          fill="none"
          d="M379,764.27v19.47c3.02-2.18,5-5.72,5-9.73C384,769.99,382.02,766.45,379,764.27z"
        />
        <path
          fill="none"
          d="M372,762c-2.45,0-4.73,0.74-6.63,2h13.26C376.73,762.74,374.45,762,372,762z"
        />
        <path
          fill="none"
          d="M372,786c2.45,0,4.73-0.74,6.63-2h-13.26C367.27,785.26,369.55,786,372,786z"
        />
        <path
          fill="none"
          d="M360,774c0,4.01,1.98,7.55,5,9.73v-19.47C361.98,766.45,360,769.99,360,774z"
        />
        <g>
          <polygon
            fill="#CC3333"
            points="346,763 300,763 300,765 346,765 348,765 348,763 348,729 346,729  "
          />
          <polygon
            fill="#CC3333"
            points="300,783 300,785 346,785 346,819 348,819 348,785 348,783 346,783  "
          />
          <polygon
            fill="#CC3333"
            points="398,763 398,729 396,729 396,763 396,765 398,765 444,765 444,763  "
          />
          <polygon
            fill="#CC3333"
            points="396,783 396,785 396,819 398,819 398,785 444,785 444,783 398,783  "
          />
          <path
            fill="#CC3333"
            d="M372,762c-2.45,0-4.73,0.74-6.63,2h0v0c-3.24,2.15-5.37,5.82-5.37,10s2.14,7.85,5.37,10l0,0h0 c1.9,1.26,4.18,2,6.63,2c2.45,0,4.73-0.74,6.63-2c3.24-2.15,5.37-5.82,5.37-10C384,767.37,378.63,762,372,762z M364,779.97 c-1.25-1.67-2-3.73-2-5.97s0.75-4.31,2-5.97V779.97z M380,779.97v-11.95c1.25,1.67,2,3.73,2,5.97S381.25,778.31,380,779.97z"
          />
        </g>
      </g>
    </g>
    <g>
      <g>
        <g>
          <circle fill="none" cx={2028} cy={246} r={180} />
          <path
            fill="#CC3333"
            d="M2028,68c24.03,0,47.34,4.71,69.28,13.99c21.2,8.97,40.23,21.8,56.58,38.15s29.18,35.38,38.15,56.58 c9.28,21.94,13.99,45.25,13.99,69.29s-4.71,47.34-13.99,69.29c-8.97,21.2-21.8,40.23-38.15,56.58 c-16.35,16.35-35.38,29.18-56.58,38.15c-21.94,9.28-45.25,13.99-69.28,13.99s-47.34-4.71-69.29-13.99 c-21.2-8.97-40.23-21.8-56.58-38.15c-16.35-16.35-29.18-35.38-38.15-56.58c-9.28-21.94-13.99-45.25-13.99-69.29 s4.71-47.34,13.99-69.29c8.97-21.2,21.8-40.23,38.15-56.58c16.35-16.35,35.38-29.18,56.58-38.15 C1980.66,72.71,2003.97,68,2028,68 M2028,66c-99.41,0-180,80.59-180,180s80.59,180,180,180c99.41,0,180-80.59,180-180 S2127.41,66,2028,66L2028,66z"
          />
        </g>
        <path
          fill="#CC3333"
          d="M2028,236c5.51,0,10,4.49,10,10s-4.49,10-10,10s-10-4.49-10-10S2022.49,236,2028,236 M2028,234 c-6.63,0-12,5.37-12,12s5.37,12,12,12s12-5.37,12-12S2034.63,234,2028,234L2028,234z"
        />
        <g>
          <rect
            x={1985}
            y={218}
            transform="matrix(6.123234e-17 -1 1 6.123234e-17 1784 2222)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={1956} y={235} fill="#CC3333" width={48} height={2} />
          <rect
            x={1985}
            y={272}
            transform="matrix(-1.836970e-16 1 -1 -1.836970e-16 2276 -1730)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={1956} y={255} fill="#CC3333" width={48} height={2} />
        </g>
        <g>
          <rect
            x={2035}
            y={218}
            transform="matrix(4.496942e-11 -1 1 4.496942e-11 1834 2272)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={2052} y={235} fill="#CC3333" width={48} height={2} />
          <rect
            x={2035}
            y={272}
            transform="matrix(-4.496955e-11 1 -1 -4.496955e-11 2326 -1780)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={2052} y={255} fill="#CC3333" width={48} height={2} />
        </g>
        <polygon fill="#CC3333" points="1995,69 1993,70 1993,45 1995,45  " />
        <polygon fill="#CC3333" points="2063,70 2061,69 2061,45 2063,45  " />
        <polygon
          fill="#CC3333"
          points="1995,423 1993,422 1993,447 1995,447  "
        />
        <polygon
          fill="#CC3333"
          points="2063,422 2061,423 2061,447 2063,447  "
        />
      </g>
      <g>
        <path
          fill="none"
          d="M2035,236.27v19.47c3.02-2.18,5-5.72,5-9.73C2040,241.99,2038.02,238.45,2035,236.27z"
        />
        <path
          fill="none"
          d="M2028,234c-2.45,0-4.73,0.74-6.63,2h13.26C2032.73,234.74,2030.45,234,2028,234z"
        />
        <path
          fill="none"
          d="M2028,258c2.45,0,4.73-0.74,6.63-2h-13.26C2023.27,257.26,2025.55,258,2028,258z"
        />
        <path
          fill="none"
          d="M2016,246c0,4.01,1.98,7.55,5,9.73v-19.47C2017.98,238.45,2016,241.99,2016,246z"
        />
        <path
          fill="#CC3333"
          d="M2034.63,236h-13.26c-0.13,0.08-0.25,1.18-1.37,1.27v17.47c1.12,0.09,1.24,1.18,1.37,1.27h13.26 c0.13-0.08,0.25-1.18,1.37-1.27v-17.47C2034.88,237.18,2034.76,236.08,2034.63,236z"
        />
      </g>
    </g>
    <g>
      <g>
        <g>
          <circle fill="none" cx={2028} cy={774} r={180} />
          <path
            fill="#CC3333"
            d="M2028,596c24.03,0,47.34,4.71,69.28,13.99c21.2,8.97,40.23,21.8,56.58,38.15s29.18,35.38,38.15,56.58 c9.28,21.94,13.99,45.25,13.99,69.29s-4.71,47.34-13.99,69.29c-8.97,21.2-21.8,40.23-38.15,56.58 c-16.35,16.35-35.38,29.18-56.58,38.15c-21.94,9.28-45.25,13.99-69.28,13.99s-47.34-4.71-69.29-13.99 c-21.2-8.97-40.23-21.8-56.58-38.15c-16.35-16.35-29.18-35.38-38.15-56.58c-9.28-21.94-13.99-45.25-13.99-69.29 s4.71-47.34,13.99-69.29c8.97-21.2,21.8-40.23,38.15-56.58c16.35-16.35,35.38-29.18,56.58-38.15 C1980.66,600.71,2003.97,596,2028,596 M2028,594c-99.41,0-180,80.59-180,180s80.59,180,180,180c99.41,0,180-80.59,180-180 S2127.41,594,2028,594L2028,594z"
          />
        </g>
        <path
          fill="#CC3333"
          d="M2028,764c5.51,0,10,4.49,10,10s-4.49,10-10,10s-10-4.49-10-10S2022.49,764,2028,764 M2028,762 c-6.63,0-12,5.37-12,12s5.37,12,12,12s12-5.37,12-12S2034.63,762,2028,762L2028,762z"
        />
        <g>
          <rect
            x={1985}
            y={746}
            transform="matrix(6.123234e-17 -1 1 6.123234e-17 1256 2750)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={1956} y={763} fill="#CC3333" width={48} height={2} />
          <rect
            x={1985}
            y={800}
            transform="matrix(-1.836970e-16 1 -1 -1.836970e-16 2804 -1202)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={1956} y={783} fill="#CC3333" width={48} height={2} />
        </g>
        <g>
          <rect
            x={2035}
            y={746}
            transform="matrix(4.496942e-11 -1 1 4.496942e-11 1306 2800)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={2052} y={763} fill="#CC3333" width={48} height={2} />
          <rect
            x={2035}
            y={800}
            transform="matrix(-4.496955e-11 1 -1 -4.496955e-11 2854 -1252)"
            fill="#CC3333"
            width={36}
            height={2}
          />
          <rect x={2052} y={783} fill="#CC3333" width={48} height={2} />
        </g>
        <polygon
          fill="#CC3333"
          points="1995,597 1993,598 1993,573 1995,573  "
        />
        <polygon
          fill="#CC3333"
          points="2063,598 2061,597 2061,573 2063,573  "
        />
        <polygon
          fill="#CC3333"
          points="1995,951 1993,950 1993,975 1995,975  "
        />
        <polygon
          fill="#CC3333"
          points="2063,950 2061,951 2061,975 2063,975  "
        />
      </g>
      <g>
        <path
          fill="none"
          d="M2035,764.27v19.47c3.02-2.18,5-5.72,5-9.73C2040,769.99,2038.02,766.45,2035,764.27z"
        />
        <path
          fill="none"
          d="M2028,762c-2.45,0-4.73,0.74-6.63,2h13.26C2032.73,762.74,2030.45,762,2028,762z"
        />
        <path
          fill="none"
          d="M2028,786c2.45,0,4.73-0.74,6.63-2h-13.26C2023.27,785.26,2025.55,786,2028,786z"
        />
        <path
          fill="none"
          d="M2016,774c0,4.01,1.98,7.55,5,9.73v-19.47C2017.98,766.45,2016,769.99,2016,774z"
        />
        <path
          fill="#CC3333"
          d="M2034.63,764h-13.26c-0.13,0.08-0.25,1.18-1.37,1.27v17.47c1.12,0.09,1.24,1.18,1.37,1.27h13.26 c0.13-0.08,0.25-1.18,1.37-1.27v-17.47C2034.88,765.18,2034.76,764.08,2034.63,764z"
        />
      </g>
    </g>
    <g>
      <path
        fill="#CC3333"
        d="M2213.7,462.29c-12.17,12.06-17.7,28.48-17.7,47.71c0,19.38,5.37,35.64,17.7,47.71 c0.19,0.19,0.45,0.29,0.71,0.29H2268v392.49c0.67-0.51,1.34-1.02,2-1.54V642.23l130,35.45v-2.07l-130-35.45V557v-11h20.58 c9.62,0,17.42-7.02,17.42-15.68v-40.65c0-8.66-7.8-15.67-17.42-15.67H2270v-11v-83.24l130-35.45v-2.07l-130,35.45V71.04 c-0.66-0.52-1.33-1.02-2-1.54V462h-53.58C2214.15,462,2213.89,462.11,2213.7,462.29z M2270,544v-68h20.58 c8.5,0,15.42,6.13,15.42,13.67v40.65c0,7.54-6.92,13.68-15.42,13.68H2270z M2198,510c0-19.29,5.66-34.77,16.82-46h4.18v5h2v-5h47 v10.31v71.47V556h-47v-5h-2v5h-4.18C2203.5,544.76,2198,529.71,2198,510z"
      />
    </g>
    <g>
      <path
        fill="#CC3333"
        d="M185.58,462H132V69.51c-0.67,0.51-1.34,1.02-2,1.54v306.65L0,342.24v2.07l130,35.45V463v11h-20.58 C99.8,474,92,481.02,92,489.67v40.65c0,8.66,7.8,15.68,17.42,15.68H130v11v83.16L0,675.61v2.07l130-35.45v306.73 c0.66,0.52,1.33,1.02,2,1.54V558h53.59c0.26,0,0.52-0.1,0.71-0.29C198.63,545.64,204,529.39,204,510c0-19.23-5.54-35.64-17.7-47.71 C186.11,462.11,185.85,462,185.58,462z M109.42,544c-8.5,0-15.42-6.14-15.42-13.68v-40.65c0-7.54,6.92-13.67,15.42-13.67H130v68 H109.42z M185.18,556H181v-5h-2v5h-47v-10.22v-71.47V464h47v5h2v-5h4.18c11.16,11.24,16.82,26.71,16.82,46 C202,529.71,196.5,544.76,185.18,556z"
      />
    </g>
    <path
      fill="#CC3333"
      d="M972,774c0-6.63-5.37-12-12-12c-2.45,0-4.73,0.74-6.63,2h0v0c-3.24,2.15-5.37,5.82-5.37,10s2.14,7.85,5.37,10 l0,0h0c1.9,1.26,4.18,2,6.63,2c2.45,0,4.73-0.74,6.63-2l0,0l0,0C969.86,781.85,972,778.18,972,774z M970,774 c0,2.24-0.75,4.31-2,5.97v-11.95C969.25,769.69,970,771.76,970,774z M950,774c0-2.24,0.75-4.31,2-5.97v11.95 C950.75,778.31,950,776.24,950,774z"
    />
    <path
      fill="#CC3333"
      d="M972,246c0-6.63-5.37-12-12-12c-2.45,0-4.73,0.74-6.63,2h0v0c-3.24,2.15-5.37,5.82-5.37,10s2.14,7.85,5.37,10 l0,0h0c1.9,1.26,4.18,2,6.63,2c2.45,0,4.73-0.74,6.63-2l0,0l0,0C969.86,253.85,972,250.18,972,246z M970,246 c0,2.24-0.75,4.31-2,5.97v-11.95C969.25,241.69,970,243.76,970,246z M950,246c0-2.24,0.75-4.31,2-5.97v11.95 C950.75,250.31,950,248.24,950,246z"
    />
    <path
      fill="#CC3333"
      d="M1452,774c0-6.63-5.37-12-12-12c-2.45,0-4.73,0.74-6.63,2l0,0v0c-3.24,2.15-5.37,5.82-5.37,10 s2.14,7.85,5.37,10v0h0c1.9,1.26,4.18,2,6.63,2c2.45,0,4.73-0.74,6.63-2l0,0l0,0C1449.86,781.85,1452,778.18,1452,774z M1450,774 c0,2.24-0.75,4.31-2,5.97v-11.95C1449.25,769.69,1450,771.76,1450,774z M1430,774c0-2.24,0.75-4.31,2-5.97v11.95 C1430.75,778.31,1430,776.24,1430,774z"
    />
    <path
      fill="#CC3333"
      d="M1452,246c0-6.63-5.37-12-12-12c-2.45,0-4.73,0.74-6.63,2l0,0v0c-3.24,2.15-5.37,5.82-5.37,10 s2.14,7.85,5.37,10v0h0c1.9,1.26,4.18,2,6.63,2c2.45,0,4.73-0.74,6.63-2l0,0l0,0C1449.86,253.85,1452,250.18,1452,246z M1450,246 c0,2.24-0.75,4.31-2,5.97v-11.95C1449.25,241.69,1450,243.76,1450,246z M1430,246c0-2.24,0.75-4.31,2-5.97v11.95 C1430.75,250.31,1430,248.24,1430,246z"
    />
    <g>
      <circle fill="#3366CC" cx={1200} cy={510} r={6} />
    </g>

    {/* Wrap any Zamboni-related elements in a conditional render */}
    {displayZamboni && (
      <>
        {/* Insert Zamboni-related SVG elements here */}
        <path
      id="path1"
      fill="none"
      stroke="none"
      strokeWidth="10px"
      d="m 2031 936 H 369 C 227 932 90 847 84 622 V 428 C 86 218 239 132 461 124 H 1939 C 2092 125 2260 250 2260 372 C 2256 499 2090 586 1937 588 H 461 C 315 584 186 550 180 435 C 182 302 335 248 461 240 H 1939 C 2098 244 2243 334 2252 475 C 2254 717 2086 697 1939 704 H 461 C 331 697 184 659 180 530 C 178 389 323 364 461 356 H 1939 C 2096 354 2243 453 2243 618 C 2237 737 2080 824 1939 820 H 461 C 285 820 140 794 138 644 C 136 497 325 473 450 472 H 1939 C 2080 469 2239 572 2235 733 C 2233 822 2117 937 2031 936"
    />
    <path
      id="path2"
      fill="none"
      stroke="none"
      strokeWidth="10px"
      d="m 369 84 H 2031 C 2209 89 2313 194 2316 398 V 527 C 2310 687 2167 881 1939 896 H 461 C 308 895 140 770 140 648 C 144 521 310 434 463 432 H 1939 C 2085 436 2214 470 2220 585 C 2218 718 2065 772 1939 780 H 461 C 302 776 157 686 148 545 C 146 303 314 323 461 316 H 1939 C 2069 323 2216 361 2220 490 C 2222 631 2077 656 1939 664 H 462 C 304 666 157 567 157 402 C 163 283 320 196 461 200 H 1935 C 2115 200 2260 226 2262 376 C 2264 523 2075 547 1950 548 H 463 C 320 551 161 448 165 287 C 167 198 283 83 369 84"
    />
    <g filter="url(#ice_resurfacer_filter)">
      <rect
        x={-105}
        width={168}
        height={84}
        fill="url(#ice_resurfacer_pattern)"
        shapeRendering="geometricPrecision"
      />
      <animateMotion dur={200} repeatCount="indefinite" rotate="auto-reverse">
        <mpath xlinkHref="#path1" />
      </animateMotion>
    </g>
    <g filter="url(#ice_resurfacer_filter)">
      <rect
        x={-105}
        width={168}
        height={84}
        fill="url(#ice_resurfacer_pattern)"
        shapeRendering="geometricPrecision"
      />
      <animateMotion dur={200} repeatCount="indefinite" rotate="auto-reverse">
        <mpath xlinkHref="#path2" />
      </animateMotion>
    </g>
    <defs>
      <filter
        id="ice_resurfacer_filter"
        x={-105}
        y={0}
        width={176}
        height={92}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_59_3"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_59_3"
          result="shape"
        />
      </filter>
      <pattern
        id="ice_resurfacer_pattern"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <use
          xlinkHref="#ice_resurfacer"
          transform="scale(0.00757576 0.0151515)"
        />
      </pattern>
      <image
        id="ice_resurfacer"
        width={132}
        height={66}
        xlinkHref={zamboniImage}
      />
    </defs>
      </>
    )}

    
  </svg>
);
export default NHLEdgeHockeyRink;
