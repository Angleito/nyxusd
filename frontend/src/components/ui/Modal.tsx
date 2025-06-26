import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]',
};

const overlayVariants = {
  closed: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  open: {
    opacity: 1,
    backdropFilter: 'blur(8px)',
  },
};

const contentVariants = {
  closed: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Overlay */}
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/80"
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content asChild forceMount>
              <motion.div
                className={clsx(
                  'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-700 bg-gray-900/95 backdrop-blur-xl shadow-2xl',
                  modalSizes[size]
                )}
                variants={contentVariants}
                initial="closed"
                animate="open"
                exit="closed"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 p-[1px]">
                  <div className="absolute inset-[1px] rounded-xl bg-gray-900/95" />
                </div>

                {/* Close button */}
                {showCloseButton && (
                  <Dialog.Close asChild>
                    <motion.button
                      className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </motion.button>
                  </Dialog.Close>
                )}

                {/* Content wrapper */}
                <div className="relative z-10 p-6">
                  {children}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('space-y-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

ModalContent.displayName = 'ModalContent';

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('space-y-2 pb-4 border-b border-gray-800', className)}
      {...props}
    >
      {children}
    </div>
  )
);

ModalHeader.displayName = 'ModalHeader';

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('flex items-center justify-end space-x-3 pt-4 border-t border-gray-800', className)}
      {...props}
    >
      {children}
    </div>
  )
);

ModalFooter.displayName = 'ModalFooter';

export const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, children, ...props }, ref) => (
    <Dialog.Title asChild>
      <h2
        ref={ref}
        className={clsx('text-xl font-semibold text-white', className)}
        {...props}
      >
        {children}
      </h2>
    </Dialog.Title>
  )
);

ModalTitle.displayName = 'ModalTitle';

export const ModalDescription = React.forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <Dialog.Description asChild>
      <p
        ref={ref}
        className={clsx('text-gray-400', className)}
        {...props}
      >
        {children}
      </p>
    </Dialog.Description>
  )
);

ModalDescription.displayName = 'ModalDescription';