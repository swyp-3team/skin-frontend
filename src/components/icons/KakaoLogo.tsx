import type { SVGProps } from 'react'

function KakaoLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 4.75C7.44365 4.75 3.75 7.55771 3.75 11.0214C3.75 13.271 5.31365 15.2412 7.67261 16.278L6.86497 19.131C6.77275 19.4567 7.13805 19.7132 7.40827 19.512L11.1066 16.7543C11.3992 16.7817 11.6968 16.7957 12 16.7957C16.5563 16.7957 20.25 13.988 20.25 10.5243C20.25 7.06056 16.5563 4.75 12 4.75Z"
        fill="currentColor"
      />
      <circle cx="9" cy="10.8" fill="#FEE500" r="1" />
      <circle cx="12" cy="10.8" fill="#FEE500" r="1" />
      <circle cx="15" cy="10.8" fill="#FEE500" r="1" />
    </svg>
  )
}

export default KakaoLogo
