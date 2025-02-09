document.addEventListener('DOMContentLoaded', () => {
    const editprofileBtn = document.getElementById('edit-profile-btn');
    const modal = document.getElementById('edit-profile-modal');
    const closeModal = document.getElementById('close-modal');
    const saveChangesBtn = document.getElementById('save-changes-btn');
    const deleteProfileBtn = document.getElementById('delete-profile-btn');

    editprofileBtn.addEventListener('click', () => {
        modal.style.display = 'block'
    });
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if(event.target === modal){
            modal.style.display = 'none';
        }
    });
    saveChangesBtn.addEventListener('click', () => {
        const profilePhoto = document.getElementById('profile-photo-input').files[0];
        const profileName = document.getElementById('profile-name-input').value;
        const profileEmail = document.getElementById('profile-email-input').value;
        const linkedinId = document.getElementById('linkedin-id-input').value;
        
        if (profilePhoto) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('profile-photo').src = e.target.result;
            };
            reader.readAsDataURL(profilePhoto);
        }

        document.getElementById('profile-name').textContent = profileName;
        document.getElementById('profile-email').textContent = profileEmail;
        document.getElementById('linkedin-link').textContent = linkedinId ? linkedinId : 'Add Link';
        document.getElementById('linkedin-link').href = linkedinId ? linkedinId : '#';

        modal.style.display = 'name';
    });

    deleteProfileBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to delete your profile?')) {
            document.getElementById('profile-photo').src = '';
            document.getElementById('profile-name').textContent = '';
            document.getElementById('profile-email').textContent = '';
            document.getElementById('linkedin-link').textContent = 'Add Link';
            document.getElementById('linkedin-link').href = '#';
            modal.style.display = 'none';

        }
    });
});