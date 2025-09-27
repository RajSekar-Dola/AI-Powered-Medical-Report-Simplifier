class MedicalReportProcessor {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.currentFile = null;
    }

    initializeElements() {
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.textInput = document.getElementById('text-input');
        this.imageInput = document.getElementById('image-input');
        this.fileUploadArea = document.getElementById('file-upload-area');
        this.processTextBtn = document.getElementById('process-text-btn');
        this.processImageBtn = document.getElementById('process-image-btn');
        this.processAnotherBtn = document.getElementById('process-another-btn');
        this.tryAgainBtn = document.getElementById('try-again-btn');
        this.loadingSection = document.getElementById('loading-section');
        this.resultsSection = document.getElementById('results-section');
        this.errorSection = document.getElementById('error-section');
        this.summaryText = document.getElementById('summary-text');
        this.testsGrid = document.getElementById('tests-grid');
        this.explanationsList = document.getElementById('explanations-list');
        this.errorMessage = document.getElementById('error-message');
        this.loadingSteps = document.querySelectorAll('.step');
    }

    attachEventListeners() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });

        this.fileUploadArea.addEventListener('click', () => this.imageInput.click());
        this.fileUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.fileUploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.fileUploadArea.addEventListener('drop', this.handleDrop.bind(this));
        this.imageInput.addEventListener('change', this.handleFileSelect.bind(this));
        this.processTextBtn.addEventListener('click', this.processTextReport.bind(this));
        this.processImageBtn.addEventListener('click', this.processImageReport.bind(this));
        this.processAnotherBtn.addEventListener('click', this.resetForm.bind(this));
        this.tryAgainBtn.addEventListener('click', this.resetForm.bind(this));
        this.textInput.addEventListener('input', this.validateTextInput.bind(this));
    }

    switchTab(tabName) {
        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        this.resetForm();
    }

    handleDragOver(e) {
        e.preventDefault();
        this.fileUploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileSelection(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleFileSelection(file);
        }
    }

    handleFileSelection(file) {
        const validation = this.validateFile(file);
        if (!validation.isValid) {
            this.showError(validation.message);
            return;
        }

        this.currentFile = file;
        this.updateFileUploadDisplay(file);
        this.processImageBtn.disabled = false;
    }

    validateFile(file) {
        const maxSize = 5 * 1024 * 1024;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];

        if (file.size > maxSize) {
            return {
                isValid: false,
                message: 'File size exceeds 5MB limit. Please choose a smaller image.'
            };
        }

        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                message: 'Invalid file type. Please upload a JPG, PNG, GIF, or BMP image.'
            };
        }

        return { isValid: true };
    }

    updateFileUploadDisplay(file) {
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        this.fileUploadArea.innerHTML = `
            <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
            <p><strong>${file.name}</strong></p>
            <p class="file-info">Size: ${fileSize} MB</p>
            <p style="color: #4CAF50; font-weight: 600;">Ready to process</p>
        `;
    }

    validateTextInput() {
        const text = this.textInput.value.trim();
        this.processTextBtn.disabled = text.length < 5;
    }

    async processTextReport() {
        const text = this.textInput.value.trim();
        
        if (!text) {
            this.showError('Please enter some text to process.');
            return;
        }

        try {
            this.showLoading();
            
            const response = await fetch('/api/medical/process-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || result.reason || 'Failed to process text report');
            }

            if (result.status === 'unprocessed') {
                throw new Error(result.reason || 'Unable to process the provided text');
            }

            this.showResults(result);
            
        } catch (error) {
            console.error('Error processing text report:', error);
            this.showError(error.message || 'Failed to process text report. Please try again.');
        }
    }

    async processImageReport() {
        if (!this.currentFile) {
            this.showError('Please select an image file first.');
            return;
        }

        try {
            this.showLoading();
            
            const formData = new FormData();
            formData.append('image', this.currentFile);

            const response = await fetch('/api/medical/process-image', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || result.reason || 'Failed to process image report');
            }

            if (result.status === 'unprocessed') {
                throw new Error(result.reason || 'Unable to process the provided image');
            }

            this.showResults(result);
            
        } catch (error) {
            console.error('Error processing image report:', error);
            this.showError(error.message || 'Failed to process image report. Please try again.');
        }
    }

    showLoading() {
        this.hideAllSections();
        this.loadingSection.style.display = 'block';
        this.animateLoadingSteps();
    }

    animateLoadingSteps() {
        this.loadingSteps.forEach(step => step.classList.remove('active'));
        
        let currentStep = 0;
        const stepInterval = setInterval(() => {
            if (currentStep < this.loadingSteps.length) {
                this.loadingSteps[currentStep].classList.add('active');
                currentStep++;
            } else {
                clearInterval(stepInterval);
            }
        }, 1000);
    }

    showResults(data) {
        this.hideAllSections();
        this.resultsSection.style.display = 'block';
        this.summaryText.textContent = data.summary || 'No summary available.';
        this.displayTests(data.tests || []);
        this.displayExplanations(data.explanations || []);
    }

    displayTests(tests) {
        this.testsGrid.innerHTML = '';
        
        tests.forEach(test => {
            const testCard = this.createTestCard(test);
            this.testsGrid.appendChild(testCard);
        });
    }

    createTestCard(test) {
        const card = document.createElement('div');
        card.className = `test-card ${test.status}`;
        
        const refRangeText = test.ref_range && (test.ref_range.low > 0 || test.ref_range.high > 0)
            ? `Normal range: ${test.ref_range.low} - ${test.ref_range.high} ${test.unit}`
            : 'Reference range not available';
        
        card.innerHTML = `
            <div class="test-name">${test.name}</div>
            <div class="test-value ${test.status}">
                ${test.value}
                <span class="test-unit">${test.unit}</span>
            </div>
            <div class="test-status ${test.status}">${test.status}</div>
            <div class="test-range">${refRangeText}</div>
        `;
        
        return card;
    }

    displayExplanations(explanations) {
        this.explanationsList.innerHTML = '';
        
        if (explanations.length === 0) {
            this.explanationsList.innerHTML = '<li>All test results appear to be within normal ranges.</li>';
            return;
        }
        
        explanations.forEach(explanation => {
            const listItem = document.createElement('li');
            listItem.textContent = explanation;
            this.explanationsList.appendChild(listItem);
        });
    }

    showError(message) {
        this.hideAllSections();
        this.errorSection.style.display = 'block';
        this.errorMessage.textContent = message;
    }

    hideAllSections() {
        this.loadingSection.style.display = 'none';
        this.resultsSection.style.display = 'none';
        this.errorSection.style.display = 'none';
    }

    resetForm() {
        this.textInput.value = '';
        this.imageInput.value = '';
        this.currentFile = null;
        
        this.fileUploadArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Click to select or drag and drop your image</p>
            <p class="file-info">Supports: JPG, PNG, GIF, BMP (Max 5MB)</p>
        `;
        
        this.processTextBtn.disabled = true;
        this.processImageBtn.disabled = true;
        this.hideAllSections();
        this.loadingSteps.forEach(step => step.classList.remove('active'));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MedicalReportProcessor();
});

window.addSampleData = function() {
    const sampleText = `CBC: Hemoglobin 10.2 g/dL (Low), WBC 11,200 /uL (High)
Glucose 95 mg/dL (Normal)
Cholesterol 220 mg/dL (High)`;
    
    document.getElementById('text-input').value = sampleText;
    document.getElementById('process-text-btn').disabled = false;
};

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header-content');
    const sampleButton = document.createElement('button');
    sampleButton.textContent = 'Load Sample Data';
    sampleButton.style.cssText = `
        margin-top: 20px;
        padding: 10px 20px;
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
    `;
    sampleButton.onclick = () => {
        document.querySelector('[data-tab="text"]').click();
        window.addSampleData();
    };
    header.appendChild(sampleButton);
});
