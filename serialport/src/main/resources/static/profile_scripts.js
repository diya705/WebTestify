// profile.js
document.addEventListener('DOMContentLoaded', () => {

    const app = {
        elements: {
            profilePhoto: document.getElementById('profile-photo'),
            profileName: document.getElementById('profile-name'),
            profileEmail: document.getElementById('profile-email'),
            linkedinLink: document.getElementById('linkedin-link'),
            modal: document.getElementById('edit-profile-modal'),
            editProfileBtn: document.getElementById('edit-profile-btn'),
            closeModalBtn: document.getElementById('close-modal'),
            editProfileForm: document.getElementById('edit-profile-form'),
            profilePhotoInput: document.getElementById('profile-photo-input'),
            profileNameInput: document.getElementById('profile-name-input'),
            profileEmailInput: document.getElementById('profile-email-input'),
            linkedinUrlInput: document.getElementById('linkedin-url-input'),
            saveChangesBtn: document.getElementById('save-changes-btn'),
            deleteProfileBtn: document.getElementById('delete-profile-btn'),
        },

        init() {
            this.addEventListeners();
            this.loadProfileData();
        },

        addEventListeners() {
            this.elements.editProfileBtn.addEventListener('click', () => this.openModal());
            this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
            this.elements.modal.addEventListener('click', (event) => {
                if (event.target === this.elements.modal) {
                    this.closeModal();
                }
            });
            this.elements.editProfileForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.saveChanges();
            });
            this.elements.deleteProfileBtn.addEventListener('click', () => this.deleteProfile());
        },
        
        loadProfileData() {
            this.elements.profileNameInput.value = this.elements.profileName.textContent;
            this.elements.profileEmailInput.value = this.elements.profileEmail.textContent;
            this.elements.linkedinUrlInput.value = this.elements.linkedinLink.href.startsWith('http') ? this.elements.linkedinLink.href : '';
        },

        openModal() {
            this.elements.modal.hidden = false;
            setTimeout(() => this.elements.modal.classList.add('active'), 10);
        },

        closeModal() {
            this.elements.modal.classList.remove('active');
            this.elements.modal.addEventListener('transitionend', () => {
                this.elements.modal.hidden = true;
            }, { once: true });
        },

        saveChanges() {
            const photoFile = this.elements.profilePhotoInput.files[0];
            if (photoFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.elements.profilePhoto.src = e.target.result;
                };
                reader.readAsDataURL(photoFile);
            }

            this.elements.profileName.textContent = this.elements.profileNameInput.value;
            this.elements.profileEmail.textContent = this.elements.profileEmailInput.value;
            
            const linkedinUrl = this.elements.linkedinUrlInput.value.trim();
            if (linkedinUrl) {
                this.elements.linkedinLink.href = linkedinUrl;
                this.elements.linkedinLink.textContent = 'View LinkedIn Profile';
            } else {
                this.elements.linkedinLink.href = '#';
                this.elements.linkedinLink.textContent = 'Add LinkedIn Profile';
            }

            this.closeModal();
        },

        deleteProfile() {
            if (confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
                this.elements.profilePhoto.src = 'https://i.pravatar.cc/150?u=a042581f4e29026704d';
                this.elements.profileName.textContent = 'Username';
                this.elements.profileEmail.textContent = 'user@example.com';
                this.elements.linkedinLink.href = '#';
                this.elements.linkedinLink.textContent = 'Add LinkedIn Profile';
                this.closeModal();
                this.elements.editProfileForm.reset();
            }
        }
    };

    app.init();
});