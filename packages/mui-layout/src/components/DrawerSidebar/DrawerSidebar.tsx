import React from 'react';
import cx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import useTheme from '@material-ui/core/styles/useTheme';
import { DrawerProps } from '@material-ui/core/Drawer';
import { useSidebar, SidebarProvider, useWindow } from '../../core';
import { useBreakpointConfig, useSidebarAutoCollapse } from '../../core/hooks';
import { createEdgeHeaderOffset } from '../EdgeHeaderOffset';
import {
  createDrawerVariant,
  StyledProxyDrawer,
} from '../Shared/SharedSidebar';
import styledProxy from '../Shared/StyledProxy';
import { get, createBreakpointStyles, createHiddenStyles } from '../../utils';
import { transitionStyles } from '../../styles';
import { EdgeSidebarConfig } from '../../types';

const useTransitionStyles = makeStyles(transitionStyles);
const Div = styledProxy('div')

export const createDrawerSidebar = (StyledComponent = StyledProxyDrawer, StyledDiv = Div) => {
  const TemporaryDrawer = createDrawerVariant('temporary', StyledComponent);
  const PermanentDrawer = createDrawerVariant('permanent', StyledComponent);
  const PersistentDrawer = createDrawerVariant('persistent', StyledComponent);
  const EdgeHeaderOffset = createEdgeHeaderOffset(StyledDiv)
  const DrawerSidebar = ({
    sidebarId,
    onClose,
    children,
    PaperProps,
    ModalProps,
    SlideProps,
    ...props
  }: Omit<DrawerProps, 'variant'> & {
    sidebarId: string;
  }) => {
    useSidebarAutoCollapse(sidebarId);
    const { iDocument } = useWindow();
    const transition = useTransitionStyles();
    const [entered, setEntered] = React.useState(false);
    const { breakpoints } = useTheme();
    const {
      anchor,
      edgeSidebar,
      styles: { permanent, persistent, temporary },
      state,
      setOpen,
    } = useSidebar(sidebarId);
    const wrappedOnClose: DrawerProps['onClose'] = (...args) => {
      if (typeof onClose === 'function') onClose(...args);
      setOpen(sidebarId, false);
    };
    const config = useBreakpointConfig<EdgeSidebarConfig>(
      edgeSidebar.configMapById[sidebarId]
    );
    const commonProps = {
      ...props,
      PaperProps: {
        ...PaperProps,
        className: cx(
          (entered || get(config, 'variant') === 'permanent') &&
            transition.root,
          get(PaperProps, 'className')
        ),
      },
      ModalProps: {
        container: iDocument ? iDocument.body : undefined,
        ...ModalProps,
      },
      SlideProps: {
        ...SlideProps,
        // @ts-ignore
        onEntered: (...args) => {
          if (SlideProps && typeof SlideProps.onEntered === 'function')
            // @ts-ignore
            SlideProps.onEntered(...args);
          setEntered(true);
        },
        // @ts-ignore
        onExit: arg => {
          if (SlideProps && typeof SlideProps.onExit === 'function')
            // @ts-ignore
            SlideProps.onExit(arg);
          setEntered(false);
        },
      },
      anchor,
      open: state.open,
      onClose: wrappedOnClose,
    };

    const headerAdjustment = <EdgeHeaderOffset sidebarId={sidebarId} />;

    return (
      <SidebarProvider id={sidebarId}>
        <TemporaryDrawer
          disableScrollLock
          {...commonProps}
          hiddenStyles={createHiddenStyles(
            temporary,
            [permanent, persistent],
            breakpoints
          )}
          styles={createBreakpointStyles(temporary, breakpoints)}
        >
          {children}
        </TemporaryDrawer>
        <PersistentDrawer
          {...commonProps}
          hiddenStyles={createHiddenStyles(
            persistent,
            [temporary, permanent],
            breakpoints
          )}
          styles={createBreakpointStyles(persistent, breakpoints)}
        >
          {headerAdjustment}
          {children}
        </PersistentDrawer>
        <PermanentDrawer
          {...commonProps}
          hiddenStyles={createHiddenStyles(
            permanent,
            [temporary, persistent],
            breakpoints
          )}
          styles={createBreakpointStyles(permanent, breakpoints)}
        >
          {headerAdjustment}
          {children}
        </PermanentDrawer>
      </SidebarProvider>
    );
  };

  return DrawerSidebar;
};

export default createDrawerSidebar();
