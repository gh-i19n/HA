interface HeadingProperties {
  title: string;
  description: string;
}

export const Heading: React.FC<HeadingProperties> = ({
  title,
  description,
}) => {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <p className="text-foreground-muted text-sm">{description}</p>
    </div>
  );
};
