interface TabDescriptionProps {
  descriptions: string[];
}

export default function TabDescription({ descriptions }: TabDescriptionProps): JSX.Element {
  return (
    <div className="description-container">
      {descriptions.map((description) => (
        <p key={description}>{description}</p>
      ))}
    </div>
  );
}
