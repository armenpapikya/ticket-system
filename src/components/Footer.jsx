import '../cssComponents/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} Ձեր Կազմակերպությունը. Բոլոր իրավունքները պաշտպանված են։</p>
        </footer>
    );
};

export default Footer;
