document.addEventListener('DOMContentLoaded', () => {
    const humanAgeInput = document.getElementById('human-age');
    const dogBreedSelect = document.getElementById('dog-breed');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultDiv = document.getElementById('result');

    const ageChart = {
        small: [15, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96],
        medium: [15, 24, 29, 34, 39, 44, 48, 52, 57, 61, 66, 70, 75, 79, 84, 88, 93, 97, 102, 106],
        large: [15, 24, 28, 32, 36, 42, 47, 51, 56, 60, 65, 69, 74, 78, 83, 87, 92, 96, 101, 105],
        giant: [12, 22, 31, 40, 49, 59, 68, 77, 86, 96, 105, 114, 123, 132, 141, 150, 159, 168, 177, 186]
    };

    calculateBtn.addEventListener('click', () => {
        const humanAge = parseInt(humanAgeInput.value);
        const dogBreed = dogBreedSelect.value;

        if (isNaN(humanAge) || humanAge < 1 || humanAge > 20) {
            resultDiv.textContent = 'Please enter a valid age between 1 and 20.';
            return;
        }

        const dogAge = ageChart[dogBreed][humanAge - 1];
        resultDiv.textContent = `Your dog's age is approximately ${dogAge} in human years.`;
    });
});
