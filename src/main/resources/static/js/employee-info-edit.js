function toggleEditMode() {
    document.querySelectorAll('input').forEach(el => el.style.display = 'inline-block');
    document.querySelectorAll('span').forEach(el => el.style.display = 'none');
    document.getElementById('saveBtn').style.display = 'inline-block';
    document.getElementById('cancelBtn').style.display = 'inline-block';
}

function cancelEdit() {
    location.reload(); // 새로고침으로 원래대로
}