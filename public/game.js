document.getElementById('watchAd').addEventListener('click', () => {
    // Simulate watching an ad
    setTimeout(() => {
        document.getElementById('rewardMessage').textContent = 'You earned 0.001 BTC!';
    }, 5000); // 5 seconds to watch the ad
});