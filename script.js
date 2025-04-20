
document.querySelector('.search-box input').addEventListener('input', function() {
    let searchTerm = this.value.toLowerCase();
    let topicCards = document.querySelectorAll('.topic-card');

    topicCards.forEach(card => {
        let title = card.querySelector('h2').textContent.toLowerCase();
        let description = card.querySelector('p').textContent.toLowerCase();

        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none'; 
        }
    });
});
