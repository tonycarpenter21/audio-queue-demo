import './Divider.css';

export enum DividerOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

interface DividerProps {
  hideOnDesktop?: boolean;
  hideOnMobile?: boolean;
  noMargin?: boolean;
  orientation?: DividerOrientation.Horizontal | DividerOrientation.Vertical;
  spanFullWidth?: boolean;
}

function Divider({
  hideOnDesktop = false,
  hideOnMobile = false,
  noMargin = false,
  orientation = DividerOrientation.Horizontal,
  spanFullWidth = false
}: DividerProps): JSX.Element {
  const classNames: string[] = ['divider'];

  if (orientation === 'vertical') {
    classNames.push('divider-vertical');
  }

  if (noMargin) {
    classNames.push('divider-no-margin');
  }

  if (hideOnMobile) {
    classNames.push('divider-hide-mobile');
  }

  if (hideOnDesktop) {
    classNames.push('divider-hide-desktop');
  }

  if (spanFullWidth) {
    classNames.push('divider-span-full');
  }

  return <div className={classNames.join(' ')} />;
}

export default Divider;
