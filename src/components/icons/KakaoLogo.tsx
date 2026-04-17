import type { SVGProps } from 'react'

function KakaoLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        clipRule="evenodd"
        d="M9.00005 0.600098C4.02919 0.600098 0 3.71306 0 7.55238C0 9.94012 1.55841 12.0451 3.93154 13.2971L2.93304 16.9446C2.84482 17.2669 3.21343 17.5238 3.49648 17.337L7.87337 14.4483C8.24274 14.4839 8.61811 14.5047 9.00005 14.5047C13.9705 14.5047 18 11.3919 18 7.55238C18 3.71306 13.9705 0.600098 9.00005 0.600098Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  )
}

export default KakaoLogo
