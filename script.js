// Add hover effect to vCard container
const vcard = document.querySelector('.vcard-container');

vcard.addEventListener('mouseenter', () => {
    vcard.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
});

vcard.addEventListener('mouseleave', () => {
    vcard.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
});