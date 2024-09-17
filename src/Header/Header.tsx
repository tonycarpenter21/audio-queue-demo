import './Header.css';

function Header(): JSX.Element {
  const headerText: string[] = ['Audio Queue', 'Single & Multi Channel Examples'];

  return (
    <div className="header-container">
      {headerText.map((header) => (
        <header key={header}>{header}</header>
      ))}
    </div>
  );
}

export default Header;
