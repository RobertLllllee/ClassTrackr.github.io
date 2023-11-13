
console.log('Attendancecode.js loaded');
document.getElementById("submit-code-button").addEventListener("click", function() {
    const enteredCode = document.getElementById("code").value;

    if (validateCode(enteredCode)) {
        window.location.href = "attendance.html";
    } else {
        alert("Invalid code. Please check your code and try again.");
    }
});

function validateCode(enteredCode) {
    // Retrieve the generated code from localStorage
    const generatedCode = localStorage.getItem("generatedCode");

    if (generatedCode !== null) {
        // Trim the generated code to remove whitespaces
        const trimmedGeneratedCode = generatedCode.trim();
        console.log("Entered Code:", enteredCode);
        console.log("Generated Code:", trimmedGeneratedCode);

        if (enteredCode === trimmedGeneratedCode) {
            console.log("Code is valid!");
            return true;
        } else {
            console.log("Code is invalid!");
            return false;
        }
    } else {
        console.error("Generated code is undefined. Check if it is set correctly in QRgenerator.js.");
    }

    return false;
}