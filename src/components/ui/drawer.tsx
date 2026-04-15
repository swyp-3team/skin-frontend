import { Drawer as DrawerPrimitive } from 'vaul'

import { cn } from '@/lib/utils'

function DrawerRoot({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn('fixed inset-0 z-50 bg-black/20', className)}
      {...props}
    />
  )
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'fixed top-0 left-1/2 z-50 flex h-[100dvh] w-full max-w-[390px] -translate-x-1/2 flex-col bg-white outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

export {
  DrawerRoot,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
}
