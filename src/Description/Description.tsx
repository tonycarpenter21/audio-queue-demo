import './Description.css';

function Description(props: { description: string[] }): JSX.Element {
  return (
    <div className="description-container">
      {props.description.map((description) => (
        <p className="description-text" key={description}>
          {description}
        </p>
      ))}
    </div>
  );
}

export default Description;
