import './HeaderAndDescription.css';

function HeaderAndDescription(props: {
  header: string[];
  description: string[];
}) {
  return (
    <div className="header-and-description-container">
      { props.header.map((header) => <header key={header}>{ header }</header>)}
      <div className="description-container">
        { props.description.map((description) => <p className="description" key={description}>{ description }</p>)}
      </div>
    </div>
  );
}

export default HeaderAndDescription;
