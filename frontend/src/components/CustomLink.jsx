function CustomLink(props) {
  let linkText = props.href;

  // Remove 'https://'
  linkText = linkText.replace(/^https?:\/\//, "");

  // Remove everything after ".com"
  const match = linkText.match(/^(.*?\.(com|ca|io|gov))/);
  if (match) {
    linkText = match[1];
  }

  const handleClick = (e) => {
    e.stopPropagation();
  };

  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{
        color: "white",
        fontWeight: "bold",
        textDecoration: "underline",
        marginTop: "5px",
      }}
    >
      {linkText}
    </a>
  );
}
export default CustomLink
