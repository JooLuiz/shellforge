import { siteLinks } from "../constants/siteLinks";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-links">
        <a href={siteLinks.githubRepo} target="_blank" rel="noreferrer">
          Repository
        </a>
        <a href={siteLinks.issues} target="_blank" rel="noreferrer">
          Issues
        </a>
        <a href={siteLinks.license} target="_blank" rel="noreferrer">
          License
        </a>
      </div>
      <p className="footer-credit">
        <span>Developed by </span>
        <a href="https://github.com/JooLuiz" target="_blank" rel="noreferrer">
          @JooLuiz
        </a>
      </p>
    </footer>
  );
};

export default Footer;
