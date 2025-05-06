 //////----------ADMIN.HTML SCRIPT------////
 const firebaseConfig = {
    apiKey: "AIzaSyCXCsqN-xwQ-3_bt2dTaxbmywSW002zOW4",
    authDomain: "atlantic-fluids.firebaseapp.com",
    projectId: "atlantic-fluids",
    storageBucket: "atlantic-fluids.appspot.com",
    messagingSenderId: "92805829518",
    appId: "1:92805829518:web:4aadfe255fd9bdc2348adf"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let selectedLogo = 'logo1.jpg';
let selectedWebsite = 'https://atlanticfluids.com/';
const companyAddress = "19, Jessy & Jenny Street, Off Peter Odili Road, Trans-Amadi, Port Harcourt, Rivers State, Nigeria.";

function selectLogo(element, logoPath) {
    document.querySelectorAll('.logo-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedLogo = logoPath;
}

function selectWebsite(element, url) {
    document.querySelectorAll('.website-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedWebsite = url;
}

function createField(type, containerId) {
    const container = document.getElementById(containerId);
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'dynamic-field-group';
    
    const input = document.createElement('input');
    input.type = type;
    input.className = `${type}-input`;
    input.required = container.children.length === 0;
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-field-btn';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => removeField(removeBtn);
    
    fieldGroup.append(input, removeBtn);
    container.appendChild(fieldGroup);
}

function removeField(button) {
    const container = button.closest('.dynamic-field-group').parentElement;
    if (container.children.length > 1) {
        button.closest('.dynamic-field-group').remove();
    }
}

function addEmailField() {
    createField('email', 'emailContainer');
}

function addPhoneField() {
    createField('tel', 'phoneContainer');
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const social = {
        facebook: document.getElementById('facebook').value || null,
        twitter: document.getElementById('twitter').value || null,
        linkedin: document.getElementById('linkedin').value || null,
        instagram: document.getElementById('instagram').value || null
    };

    Object.keys(social).forEach(key => {
        if (!social[key]) delete social[key];
    });

    const userId = document.getElementById('userId').value;
    const qrUrl = `https://adaba2006.github.io/VCARD/?id=${encodeURIComponent(userId)}`;

    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.innerHTML = '';

    new QRCode(qrContainer, {
        text: qrUrl,
        width: 200,
        height: 200,
        colorDark: "#000000",  // Black dots
        colorLight: "#ffffff", // White background
        correctLevel: QRCode.CorrectLevel.H
    });

    const qrBase64 = await new Promise((resolve) => {
        setTimeout(() => {
            const qrImg = qrContainer.querySelector('img');
            resolve(qrImg ? qrImg.src : null);
        }, 100);
    });

      // Add to form submission handler after QR generation
    const adminDownloadBtn = document.getElementById('adminDownloadBtn');
    adminDownloadBtn.disabled = false;
    adminDownloadBtn.onclick = () => {
        const qrImg = document.querySelector('#qrCodeContainer img');
        if (qrImg) {
            const userId = document.getElementById('userId').value;
            const link = document.createElement('a');
            link.href = qrImg.src;
            link.download = `atlantic-fluids-profile-${userId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const profileData = {
        userId: userId,
        fullname: document.getElementById('fullName').value,
        emails: Array.from(document.querySelectorAll('.email-input')).map(i => i.value),
        phones: Array.from(document.querySelectorAll('.phone-input')).map(i => i.value),
        logo: selectedLogo,
        website: selectedWebsite,
        address: companyAddress,
        social: social,
        qrCode: qrBase64,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('profiles').doc(userId).set(profileData);
        alert('Profile saved with QR Code!');
        
        document.getElementById('profileForm').reset();
        document.getElementById('emailContainer').innerHTML = '';
        document.getElementById('phoneContainer').innerHTML = '';
        addEmailField();
        addPhoneField();
        
        document.getElementById('facebook').value = '';
        document.getElementById('twitter').value = '';
        document.getElementById('linkedin').value = '';
        document.getElementById('instagram').value = '';
        
    } catch (error) {
        alert(`Error saving profile: ${error.message}`);
    }
});

window.onload = function() {
    if (document.getElementById('emailContainer').children.length === 0) {
        addEmailField();
    }
    if (document.getElementById('phoneContainer').children.length === 0) {
        addPhoneField();
    }
};
// Check if editing existing profile
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('edit');

if (editId) {
    db.collection('profiles').doc(editId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            
            // Fill basic fields
            document.getElementById('userId').value = data.userId || '';
            document.getElementById('userId').readOnly = true; // Prevent changing ID when editing
            document.getElementById('fullName').value = data.fullname || ''; // Changed to fullname to match data structure
            
            // Fill dynamic email fields
            document.getElementById('emailContainer').innerHTML = '';
            if (data.emails && data.emails.length > 0) {
                data.emails.forEach(email => {
                    const fieldGroup = document.createElement('div');
                    fieldGroup.className = 'dynamic-field-group';
                    
                    const input = document.createElement('input');
                    input.type = 'email';
                    input.className = 'email-input';
                    input.value = email;
                    input.required = true;
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'remove-field-btn';
                    removeBtn.innerHTML = '×';
                    removeBtn.onclick = () => removeField(removeBtn);
                    
                    fieldGroup.append(input, removeBtn);
                    document.getElementById('emailContainer').appendChild(fieldGroup);
                });
            } else {
                addEmailField();
            }
            
            // Fill dynamic phone fields
            document.getElementById('phoneContainer').innerHTML = '';
            if (data.phones && data.phones.length > 0) {
                data.phones.forEach(phone => {
                    const fieldGroup = document.createElement('div');
                    fieldGroup.className = 'dynamic-field-group';
                    
                    const input = document.createElement('input');
                    input.type = 'tel';
                    input.className = 'phone-input';
                    input.value = phone;
                    input.required = true;
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'remove-field-btn';
                    removeBtn.innerHTML = '×';
                    removeBtn.onclick = () => removeField(removeBtn);
                    
                    fieldGroup.append(input, removeBtn);
                    document.getElementById('phoneContainer').appendChild(fieldGroup);
                });
            } else {
                addPhoneField();
            }
            
            // Fill social media fields
            if (data.social) {
                document.getElementById('facebook').value = data.social.facebook || '';
                document.getElementById('twitter').value = data.social.twitter || '';
                document.getElementById('linkedin').value = data.social.linkedin || '';
                document.getElementById('instagram').value = data.social.instagram || '';
            }
            
            // Set logo selection - match based on the stored value
            if (data.logo) {
                const logoOptions = document.querySelectorAll('.logo-option');
                logoOptions.forEach(option => {
                    if (option.getAttribute('onclick').includes(data.logo)) {
                        selectLogo(option, data.logo);
                    }
                });
            }
            
            // Set website selection
            if (data.website) {
                const websiteOptions = document.querySelectorAll('.website-option');
                websiteOptions.forEach(option => {
                    if (option.getAttribute('onclick').includes(data.website)) {
                        selectWebsite(option, data.website);
                    }
                });
            }
        }
    }).catch(error => {
        console.error("Error fetching profile for editing:", error);
    });
}
 
 
 
 ///---------------INDEX.HTML CODE-----------///


// DOM Elements
const elements = {
    downloadQrBtn: document.getElementById('downloadQrBtn'),
    vcardQrCode: document.getElementById('vcardQrCode'),
    fullName: document.getElementById('fullName'),
    companyLogo: document.getElementById('companyLogo'),
    website: document.getElementById('website'),
    address: document.getElementById('address'),
    emails: document.getElementById('emails'),
    phones: document.getElementById('phones'),
    socialLinks: document.getElementById('social-links')
};

// Profile Data Loader
class ProfileManager {
    constructor() {
        this.profileId = new URLSearchParams(window.location.search).get('id');
    }

    async initialize() {
        if (!this.profileId) {
            this.showError("No profile ID provided in URL");
            return;
        }

        try {
            const doc = await db.collection("profiles").doc(this.profileId).get();
            if (!doc.exists) {
                this.showError("Profile not found");
                return;
            }
            this.updateUI(doc.data());
        } catch (error) {
            this.showError(`Failed to load profile: ${error.message}`);
            console.error("Profile load error:", error);
        }
    }

    // Update all UI elements with profile data
    updateUI(profileData) {
        this.updateBasicInfo(profileData);
        this.updateContactInfo(profileData);
        this.updateSocialLinks(profileData.social);
        this.setupQRCodeDownload(profileData);
    }

    updateBasicInfo({ fullname = 'Atlantic Fluids', logo, website, address, qrCode }) {
        elements.fullName.textContent = fullname;
        this.updateLogo(logo);
        this.updateWebsite(website);
        this.updateAddress(address);
        this.updateQRCodeDisplay(qrCode);
    }

    updateLogo(logoPath) {
        if (logoPath && typeof logoPath === 'string') {
            elements.companyLogo.querySelector('img').src = logoPath;
        }
    }

    updateWebsite(websiteUrl) {
        if (websiteUrl && this.isValidUrl(websiteUrl)) {
            elements.website.href = websiteUrl;
            elements.website.querySelector('span').textContent = 
                new URL(websiteUrl).hostname.replace('www.', '');
        } else {
            elements.website.querySelector('span').textContent = 'Website not available';
            elements.website.removeAttribute('href');
        }
    }

    updateAddress(address) {
        if (address && typeof address === 'string') {
            elements.address.querySelector('span').innerHTML = 
                address.replace(/\n/g, '<br>');
        } else {
            elements.address.querySelector('span').textContent = 'Address not available';
        }
    }

    updateContactInfo({ emails = [], phones = [] }) {
        this.populateContactList('emails', emails, 'envelope', 'mailto:');
        this.populateContactList('phones', phones, 'phone', 'tel:');
    }

    populateContactList(containerId, items, iconType, prefix) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (Array.isArray(items) && items.length > 0) {
            items.forEach(item => {
                container.appendChild(this.createContactElement(item, iconType, prefix));
            });
        } else {
            container.appendChild(this.createEmptyState(containerId));
        }
    }

    createContactElement(value, icon, prefix) {
        const element = document.createElement('a');
        element.className = 'contact-item contact-link';
        element.href = `${prefix}${value}`;
        element.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${icon === 'phone' ? this.formatPhoneNumber(value) : value}</span>
        `;
        return element;
    }

    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    }

    createEmptyState(type) {
        const emptyState = document.createElement('div');
        emptyState.className = 'contact-item';
        emptyState.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>No ${type} available</span>
        `;
        return emptyState;
    }

    updateSocialLinks(socialData = {}) {
        elements.socialLinks.innerHTML = '';
        const validPlatforms = this.getValidSocialPlatforms(socialData);
        
        validPlatforms.forEach(({ platform, url }) => {
            elements.socialLinks.appendChild(this.createSocialLink(platform, url));
        });

        if (validPlatforms.length === 0) {
            elements.socialLinks.appendChild(this.createSocialEmptyState());
        }
    }

    getValidSocialPlatforms(socialData) {
        const platforms = [
            { name: 'facebook', icon: 'facebook-f' },
            { name: 'twitter', icon: 'twitter' },
            { name: 'linkedin', icon: 'linkedin-in' },
            { name: 'instagram', icon: 'instagram' }
        ];

        return platforms.reduce((acc, platform) => {
            if (socialData[platform.name] && this.isValidUrl(socialData[platform.name])) {
                acc.push({
                    platform,
                    url: socialData[platform.name]
                });
            }
            return acc;
        }, []);
    }

    createSocialLink({ name, icon }, url) {
        const link = document.createElement('a');
        link.className = 'social-item';
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = `
            <i class="fab fa-${icon}"></i>
            <span>${name.charAt(0).toUpperCase() + name.slice(1)}</span>
        `;
        return link;
    }

    createSocialEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'social-item';
        emptyState.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>No social links available</span>
        `;
        return emptyState;
    }

    updateQRCodeDisplay(qrCode) {
        elements.vcardQrCode.innerHTML = qrCode 
            ? `<img src="${qrCode}" alt="Profile QR Code">`
            : '<p>QR Code not available</p>';
    }

    setupQRCodeDownload(profileData) {
        elements.downloadQrBtn.disabled = false;
        elements.downloadQrBtn.onclick = () => 
            this.downloadQRCode(this.profileId, profileData.qrCode);
    }

    downloadQRCode(userId, base64Data) {
        if (!base64Data) {
            alert('QR code not available for download');
            return;
        }

        const blob = this.base64ToBlob(base64Data);
        const url = window.URL.createObjectURL(blob);
        
        const tempLink = document.createElement('a');
        tempLink.href = url;
        tempLink.download = `atlantic-fluids-profile-${userId}.png`;
        document.body.appendChild(tempLink);
        tempLink.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(tempLink);
    }

    base64ToBlob(base64Data) {
        const byteCharacters = atob(base64Data.split(',')[1]);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length).fill(0).map((_, i) => slice.charCodeAt(i));
            byteArrays.push(new Uint8Array(byteNumbers));
        }
        
        return new Blob(byteArrays, { type: 'image/png' });
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    showError(message) {
        document.querySelector('main').innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>${message}</h3>
                <p>Please check the URL or try again later</p>
            </div>
        `;
        console.error(message);
    }
}

// Initialize Application
const profileManager = new ProfileManager();
profileManager.initialize();
