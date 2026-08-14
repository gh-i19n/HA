/** Introduces a form section with an optional token-backed visual marker. */
export const FormHeader = ({
  title,
  subTitle,
  icon,
}: {
  title: string;
  subTitle?: string;
  icon?: React.ReactNode;
}) => {
  return (
    <div className="mb-8 flex items-start gap-4">
      {icon && (
        <div className="bg-primary/10 text-primary mt-2 lg:mt-1 flex size-12 items-center justify-center rounded-md p-2">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-xl font-semibold leading-tight tracking-tight text-foreground lg:text-2xl">
          {title}
        </h3>
        <p className="text-foreground-muted text-sm">{subTitle}</p>
      </div>
    </div>
  );
};
