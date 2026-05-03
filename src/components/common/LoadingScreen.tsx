import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import lottie from 'lottie-web'

import loadingJson from '@/assets/lottie/loading.json'

interface LoadingScreenProps {
  text: string
}

function LoadingScreen({ text }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const anim = lottie.loadAnimation({
      container,
      animationData: loadingJson,
      renderer: 'svg',
      loop: true,
      autoplay: true,
    })

    return () => anim.destroy()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 'max(0px, calc((100vw - 390px) / 2))',
        width: '100%',
        maxWidth: '390px',
        height: '100dvh',
        background: 'white',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ transform: 'translateY(-40px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div ref={containerRef} style={{ width: 160, height: 160 }} />
        <p
          style={{
            color: 'var(--Neutral-600, #3A3D3B)',
            fontSize: 18,
            fontFamily: 'Pretendard',
            fontWeight: 400,
            lineHeight: '25.56px',
          }}
        >
          {text}
        </p>
      </div>
    </motion.div>
  )
}

export default LoadingScreen
