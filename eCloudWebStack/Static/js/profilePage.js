document.addEventListener('DOMContentLoaded', function() {
    const editButton = document.getElementById('edit_button');
    const saveButton = document.getElementById('save_changes');
    const fields = ['first_name', 'last_name', 'email', 'phone_number'];

    // When the "Edit" button is clicked, toggle the readonly state of the fields
    editButton.addEventListener('click', function() {
        let isEditable = false;

        // Loop through fields and toggle readonly
        fields.forEach(function(fieldId) {
            const field = document.getElementById(fieldId);
            if (field.readOnly) {
                field.readOnly = false;  // Make the field editable
                isEditable = true;  // Set the editable flag to true
            } else {
                field.readOnly = true;  // Make the field readonly again
            }
        });

        // If any field is editable, show the Save button
        if (isEditable) {
            saveButton.style.display = 'block'; // Show Save button
            editButton.textContent = 'Cancel';  // Change Edit button text to 'Cancel'
        } else {
            saveButton.style.display = 'none'; // Hide Save button
            editButton.textContent = 'Edit';   // Change Cancel back to Edit
        }
    });
});
