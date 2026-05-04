import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import lottie from 'lottie-web'

import loadingJson from '@/assets/lottie/loading.json'

interface LoadingScreenProps {
  text?: string
  texts?: string[]
  textSwitchIntervalMs?: number
}

function LoadingScreen({ text, texts, textSwitchIntervalMs = 1200 }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textsSignature = texts?.join('\u0001') ?? ''
  const messageList = useMemo(() => {
    const normalizedTexts = (texts ?? []).map((item) => item.trim()).filter((item) => item.length > 0)
    if (normalizedTexts.length > 0) {
      return normalizedTexts
    }

    const fallbackText = text?.trim()
    return fallbackText ? [fallbackText] : ['']
  }, [text, textsSignature])
  const [messageIndex, setMessageIndex] = useState(0)
  const currentMessage = messageList[messageIndex] ?? messageList[0] ?? ''

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

  useEffect(() => {
    setMessageIndex(0)
  }, [textsSignature, text])

  useEffect(() => {
    if (messageList.length <= 1 || messageIndex >= messageList.length - 1) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setMessageIndex((prevIndex) => Math.min(prevIndex + 1, messageList.length - 1))
    }, textSwitchIntervalMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [messageIndex, messageList, textSwitchIntervalMs])

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
        <div style={{ minHeight: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence initial={false} mode="wait">
            <motion.p
              key={`${messageIndex}-${currentMessage}`}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              style={{
                margin: 0,
                color: 'var(--Neutral-600, #3A3D3B)',
                fontSize: 18,
                fontFamily: 'Pretendard',
                fontWeight: 400,
                lineHeight: '25.56px',
              }}
            >
              {currentMessage}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default LoadingScreen
