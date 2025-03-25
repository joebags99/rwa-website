/**
 * Roll With Advantage - Character Quiz JavaScript
 * This file contains the quiz logic for the "Which Crimson Court Character Are You?" quiz
 */

document.addEventListener('DOMContentLoaded', function() {
    // Quiz data
    const quizData = {
        characters: [
            {
                name: "Talon",
                description: "Calm, compassionate, and diplomatic, Talon is a natural leader who values unity and fair governance above all. They understand that true strength lies in bringing people together and listening to all voices, making decisions that benefit the realm as a whole.",
                quote: "I weigh the impact on my people first, but I keep the door open to peaceful negotiation.",
                traits: ["Compassionate", "Diplomatic", "Fair", "Balanced", "Thoughtful"],
                image: "assets/images/tools/chibi_talon.png"
            },
            {
                name: "Edwinn",
                description: "Kind-hearted and selfless, Edwinn prioritizes the well-being of others before themselves. They believe in peaceful resolutions and have a strong sense of empathy, often going out of their way to help those in need, regardless of status or station.",
                quote: "Lives are worth more than the borders of a kingdom.",
                traits: ["Kind", "Selfless", "Peaceful", "Healing", "Humble"],
                image: "assets/images/tools/chibi_edwinn.png"
            },
            {
                name: "Xanthe",
                description: "Pragmatic and calculating, Xanthe believes in firm rule and decisive action. They prioritize the strength and advancement of the kingdom, often making tough decisions that might seem harsh but are aimed at long-term prosperity and security.",
                quote: "If it is advantageous to the kingdom, refusal would be irresponsible.",
                traits: ["Strategic", "Pragmatic", "Ambitious", "Decisive", "Disciplined"],
                image: "assets/images/tools/chibi_xanthe.png"
            },
            {
                name: "Cailynn",
                description: "Bold and intuitive, Cailynn balances spiritual insight with practical leadership. They believe in addressing issues directly and value both courage and loyalty, understanding that true strength comes from the spirit and will of the people.",
                quote: "A Kingdom's might is not measured by riches but instead by the Will of its people.",
                traits: ["Bold", "Spiritual", "Direct", "Intuitive", "Assertive"],
                image: "assets/images/tools/chibi_cailynn.png"
            },
            {
                name: "Marik",
                description: "Cautious yet practical, Marik values skills and deeds over words. They believe in being prepared for any situation and proving oneself through actions. While wary of potential threats, they understand that overreaction can sometimes cause more harm than good.",
                quote: "Talk is cheap, let them talk. Overreacting to words will do more harm to my kingdom than anything they could say.",
                traits: ["Cautious", "Practical", "Observant", "Skilled", "Vigilant"],
                image: "assets/images/tools/chibi_marik.png"
            },
            {
                name: "Via",
                description: "Cheerful and sincere, Via approaches leadership with enthusiasm and genuine care for others. They might seem carefree at times, but have a deep commitment to their people and will defend them passionately when needed.",
                quote: "I'd give them a warm bed, clean clothes, and a full belly! If it's a bestie we would have a sleepover.",
                traits: ["Cheerful", "Sincere", "Enthusiastic", "Caring", "Genuine"],
                image: "assets/images/tools/chibi_via.png"
            }
        ],
        questions: [
            {
                question: "A foreign emissary arrives unannounced at your court, demanding audience. How do you handle this unexpected visit?",
                answers: [
                    { text: "I would welcome them warmly, hear them out, and ensure no voices go unheard.", character: 0 },
                    { text: "I try to de-escalate the situation and then listen to the emissaries' requests.", character: 1 },
                    { text: "The Ederian court takes no demands. The emissary will be heard, but cautiously so.", character: 2 },
                    { text: "Acknowledge their audacity, but assert your authority as the decision-maker while ensuring they feel heard.", character: 3 },
                    { text: "Welcome them in, but search them for any concealed weapons or traps. One can't be too careful.", character: 4 },
                    { text: "Hear out a brief explanation for the unexpected arrival. Depending on severity, they'll be met immediately or wait.", character: 5 }
                ]
            },
            {
                question: "You overhear rumors of a plot brewing within your own family. What is your initial reaction?",
                answers: [
                    { text: "I seek the truth carefully, knowing trust must be earned, even among kin.", character: 0 },
                    { text: "I gather everyone into the same room and bring up the rumors in order to prevent any ill intent.", character: 1 },
                    { text: "It is something to be expected, but disputes must be dealt with quickly, quietly, and decisively.", character: 2 },
                    { text: "Address the issue head-on—fires spread quickly when left unchecked.", character: 3 },
                    { text: "Stay back and watch as they fight and tire each other out, intervene when necessary.", character: 4 },
                    { text: "They're family. I'm sure whatever issue there is we can sort through it together.", character: 5 }
                ]
            },
            {
                question: "A distant kingdom requests your help during a severe famine. How do you decide to assist?",
                answers: [
                    { text: "I send aid quickly, recalling that compassion for others strengthens our own realm.", character: 0 },
                    { text: "I send aid quickly while also offering my services to heal.", character: 1 },
                    { text: "If our kingdom enjoys surplus, aid could be leveraged for our benefit.", character: 2 },
                    { text: "Send aid quickly and offer further refuge if needed.", character: 3 },
                    { text: "Send the aid, on the promise that should our kingdom ever need aid, the kindness will be returned.", character: 4 },
                    { text: "Send aid quickly but be sure to manage rations. The entire country will take a hit ensuring as few go hungry as possible.", character: 5 }
                ]
            },
            {
                question: "You have the chance to secretly visit the city incognito. What do you most hope to learn from everyday folk?",
                answers: [
                    { text: "I want to hear their songs and stories, to understand their joys and struggles firsthand.", character: 0 },
                    { text: "I want to know their struggles and learn how I can make a difference.", character: 1 },
                    { text: "Most people mind their tongue around nobility, this would be a chance to root out dissent or discontent.", character: 2 },
                    { text: "It is crucial to understand the values and way of life of the common folk; we should hope to learn all we can.", character: 3 },
                    { text: "I need to know how the common people see me. It's easier to bow when faced with royalty, but what is whispered in secret?", character: 4 },
                    { text: "Oh I would love to see what school is like for the regular people! I bet it's so much more relaxing since they don't have to worry about managing kingdoms.", character: 5 }
                ]
            },
            {
                question: "A noble lord you distrust proposes a marriage alliance. How do you respond?",
                answers: [
                    { text: "I weigh the impact on my people first, but I keep the door open to peaceful negotiation.", character: 0 },
                    { text: "I politely decline, although a gracious offer I would not be able to accept.", character: 1 },
                    { text: "If it is advantageous to the kingdom, refusal would be irresponsible.", character: 2 },
                    { text: "Stifle laughter and politely refuse.", character: 3 },
                    { text: "An alliance formed out of any dissent will yield awful results, especially for the one getting married.", character: 4 },
                    { text: "Omg NO WAY! I can feel my face turning red just thinking about it.", character: 5 }
                ]
            },
            {
                question: "A family heirloom is stolen from the palace vaults. What is your first course of action?",
                answers: [
                    { text: "I quietly organize an investigation, balancing swift justice with the need for discretion.", character: 0 },
                    { text: "I'll interrogate the guards and others in the area. If I must, I will cast zone of truth.", character: 1 },
                    { text: "The palace should be put in lockdown, suspects located and questioned.", character: 2 },
                    { text: "Connect with the powers beyond this world to help snuff out the thief.", character: 3 },
                    { text: "Find the path used to enter or exit the vault, track the intruders down and prove their guilt.", character: 4 },
                    { text: "I'd cast a spell to locate the object. ^-^", character: 5 }
                ]
            },
            {
                question: "An old friend from your adventuring days arrives, seeking refuge at court. What is your reaction?",
                answers: [
                    { text: "I offer safe haven without hesitation, remembering the bonds forged on the road.", character: 0 },
                    { text: "I accommodate them immediately without question. I then make sure to gain information about their refuge to help in any way I can.", character: 1 },
                    { text: "I question their need for refuge, ensuring it won't bring danger to our doorstep.", character: 2 },
                    { text: "Quickly welcome them refuge and offer any additional aid.", character: 3 },
                    { text: "They will be welcomed in, have fresh food prepared and a roaring fire to greet them of course!", character: 4 },
                    { text: "I'd give them a warm bed, clean clothes, and a full belly! If it's a bestie we would have a sleepover.", character: 5 }
                ]
            },
            {
                question: "One of your trusted advisors disagrees with you publicly during a council meeting. How do you handle it?",
                answers: [
                    { text: "I give them room to speak, then reconcile our differences openly in front of everyone.", character: 0 },
                    { text: "Disagreement is part of the game; as long as their disagreement does not seem malicious.", character: 1 },
                    { text: "Quickly dismiss concerns in public, their grievances best expressed in private.", character: 2 },
                    { text: "Allow them to speak their mind. Disagreements can sometimes bring about better solutions.", character: 3 },
                    { text: "Hear them out, but warn them of how they approach concerns in the future. There are ways disagreements can be made known without causing conflict.", character: 4 },
                    { text: "That's ok. We're always learning. I wouldn't appreciate if they were rude but if they're already a trusted advisor then I need to hear them out.", character: 5 }
                ]
            },
            {
                question: "A rival house invites you to a grand feast celebrating their latest victory. Do you attend, and why?",
                answers: [
                    { text: "I go in the spirit of understanding, for shared tables can soothe old rivalries.", character: 0 },
                    { text: "If I have better things to do, I do not attend but I send my greatest regards.", character: 1 },
                    { text: "I would attend, taking the time to better evaluate their capabilities and position myself accordingly.", character: 2 },
                    { text: "Keeping my guard up and my smile sharp, I would attend to gather as much information as possible.", character: 3 },
                    { text: "Attend, rivalries lead to stronger houses. Seeing their victory will only motivate me to have my own.", character: 4 },
                    { text: "It could help ease some tensions. They extended the invite so they clearly want to mend our bond.", character: 5 }
                ]
            },
            {
                question: "Tensions rise between two powerful merchant guilds in your realm. How do you mediate the conflict?",
                answers: [
                    { text: "I gather them under one roof, helping each side see the other's worth and concerns.", character: 0 },
                    { text: "Bring them together to listen to their concerns, mediate the situation, and work toward a peaceful resolution.", character: 1 },
                    { text: "I would pass stronger laws ensuring their efforts are spent efficiently, not on bickering.", character: 2 },
                    { text: "Speak to each guild independently to assess the situation before meeting together to come to a solution.", character: 3 },
                    { text: "Speak to them individually and try to see which parts of their stories match and who is being dishonest.", character: 4 },
                    { text: "I would try and learn as much information as possible. These things are riddled with complex history and healing takes time as well as a delicate hand.", character: 5 }
                ]
            }
        ]
    };

    // DOM Elements
    const startButton = document.getElementById('start-quiz');
    const introScreen = document.getElementById('intro-screen');
    const questionScreen = document.getElementById('question-screen');
    const resultsScreen = document.getElementById('results-screen');
    const questionText = document.getElementById('question-text');
    const answerOptions = document.getElementById('answer-options');
    const currentQuestionElem = document.getElementById('current-question');
    const totalQuestionsElem = document.getElementById('total-questions');
    const progressBar = document.getElementById('quiz-progress');
    
    // Results Elements
    const characterNameElem = document.getElementById('character-name');
    const matchPercentElem = document.getElementById('match-percent');
    const characterImageElem = document.getElementById('character-image');
    const characterDescriptionElem = document.getElementById('character-description');
    const characterQuoteElem = document.getElementById('character-quote');
    const traitsGridElem = document.getElementById('traits-grid');
    const downloadButton = document.getElementById('download-results');
    const shareButton = document.getElementById('share-results');
    const retakeButton = document.getElementById('retake-quiz');
    const shareModal = document.getElementById('share-modal');
    const modalCloseButton = document.querySelector('.modal-close');
    const copyButton = document.getElementById('share-copy');
    const copyAlert = document.getElementById('copy-alert');
    
    // Quiz state
    let currentQuestion = 0;
    let characterScores = [0, 0, 0, 0, 0, 0]; // Scores for each character
    let answeredQuestions = 0;

    // Initialize the quiz
    function initQuiz() {
        // Set total questions
        totalQuestionsElem.textContent = quizData.questions.length;
        
        // Add event listeners
        startButton.addEventListener('click', startQuiz);
        retakeButton.addEventListener('click', resetQuiz);
        downloadButton.addEventListener('click', downloadResults);
        shareButton.addEventListener('click', openShareModal);
        modalCloseButton.addEventListener('click', closeShareModal);
        
        // Share buttons
        document.getElementById('share-twitter').addEventListener('click', shareOnTwitter);
        document.getElementById('share-facebook').addEventListener('click', shareOnFacebook);
        document.getElementById('share-reddit').addEventListener('click', shareOnReddit);
        copyButton.addEventListener('click', copyShareLink);
        
        // Add magical animations to character silhouettes
        animateCharacterSilhouettes();
    }

    // Start the quiz
    function startQuiz() {
        introScreen.classList.remove('active');
        questionScreen.classList.add('active');
        
        // Reset quiz state
        currentQuestion = 0;
        characterScores = [0, 0, 0, 0, 0, 0];
        answeredQuestions = 0;
        
        // Load the first question
        loadQuestion();
    }

    // Load a question
    function loadQuestion() {
        // Update progress
        currentQuestionElem.textContent = currentQuestion + 1;
        const progressPercentage = ((currentQuestion) / quizData.questions.length) * 100;
        progressBar.style.width = progressPercentage + '%';
        
        // Get the current question
        const question = quizData.questions[currentQuestion];
        questionText.textContent = question.question;
        
        // Clear previous answers
        answerOptions.innerHTML = '';
        
        // Add the answer options
        question.answers.forEach((answer, index) => {
            const answerElement = document.createElement('div');
            answerElement.className = 'answer-option';
            answerElement.innerHTML = `
                <div class="answer-check"><i class="fas fa-check"></i></div>
                <div class="answer-text">${answer.text}</div>
            `;
            
            // Add click event
            answerElement.addEventListener('click', () => selectAnswer(index));
            
            // Add to the DOM
            answerOptions.appendChild(answerElement);
        });
        
        // Add some magical animations
        animateAnswerOptions();
    }

    // Handle answer selection
    function selectAnswer(answerIndex) {
        // Remove any previously selected answers
        const allOptions = document.querySelectorAll('.answer-option');
        allOptions.forEach(option => option.classList.remove('selected'));
        
        // Mark selected option
        allOptions[answerIndex].classList.add('selected');
        
        // Update score for the chosen character
        const characterIndex = quizData.questions[currentQuestion].answers[answerIndex].character;
        characterScores[characterIndex]++;
        
        // Add magical selection effect
        addMagicalSelectionEffect(allOptions[answerIndex]);
        
        // Wait a moment before proceeding to next question
        setTimeout(() => {
            answeredQuestions++;
            
            if (currentQuestion < quizData.questions.length - 1) {
                currentQuestion++;
                loadQuestion();
            } else {
                showResults();
            }
        }, 800);
    }

    // Show quiz results
    function showResults() {
        questionScreen.classList.remove('active');
        resultsScreen.classList.add('active');
        
        // Calculate which character has the highest score
        const maxScore = Math.max(...characterScores);
        const winningCharacterIndex = characterScores.indexOf(maxScore);
        const winningCharacter = quizData.characters[winningCharacterIndex];
        
        // Calculate match percentage
        const matchPercentage = Math.round((maxScore / answeredQuestions) * 100);
        
        // Update the results display
        characterNameElem.textContent = winningCharacter.name;
        matchPercentElem.textContent = matchPercentage;
        characterImageElem.src = winningCharacter.image;
        characterImageElem.alt = `${winningCharacter.name} character illustration`;
        characterDescriptionElem.textContent = winningCharacter.description;
        characterQuoteElem.textContent = winningCharacter.quote;
        
        // Populate traits
        traitsGridElem.innerHTML = '';
        winningCharacter.traits.forEach(trait => {
            const traitElement = document.createElement('div');
            traitElement.className = 'trait-item';
            traitElement.innerHTML = `
                <div class="trait-icon"><i class="fas fa-gem"></i></div>
                <div class="trait-name">${trait}</div>
            `;
            traitsGridElem.appendChild(traitElement);
        });
        
        // Generate QR code
        generateQRCode();
        
        // Create the chart
        createResultsChart();
        
        // Add magical reveal animation
        animateResults();
    }

    // Create the results chart
    function createResultsChart() {
        const ctx = document.getElementById('results-chart').getContext('2d');
        
        // Calculate percentages for all characters
        const percentages = characterScores.map(score => Math.round((score / answeredQuestions) * 100));
        
        // Character names
        const labels = quizData.characters.map(char => char.name);
        
        // Character colors
        const colors = [
            'rgba(75, 192, 192, 0.7)',  // Talon - Teal
            'rgba(54, 162, 235, 0.7)',  // Edwinn - Blue
            'rgba(153, 102, 255, 0.7)', // Xanthe - Purple
            'rgba(255, 99, 132, 0.7)',  // Cailynn - Pink
            'rgba(255, 159, 64, 0.7)',  // Marik - Orange
            'rgba(255, 205, 86, 0.7)'   // Via - Yellow
        ];
        
        // Destroy previous chart if it exists
        if (window.resultChart) {
            window.resultChart.destroy();
        }
        
        // Create new chart
        window.resultChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Character Match %',
                    data: percentages,
                    backgroundColor: 'rgba(195, 10, 61, 0.2)',
                    borderColor: 'rgba(195, 10, 61, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: colors,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: colors
                }]
            },
            options: {
                elements: {
                    line: {
                        tension: 0.1
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Generate QR code for the quiz
    function generateQRCode() {
        const qrContainer = document.getElementById('qr-code');
        qrContainer.innerHTML = '';
        
        // Get the current URL
        const quizUrl = window.location.href.split('#')[0];
        
        // Generate QR code
        new QRCode(qrContainer, {
            text: quizUrl,
            width: 100,
            height: 100,
            colorDark: "#c30a3d",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // Download results as an image
    function downloadResults() {
        const resultsCard = document.getElementById('results-card');
        
        // Add loading state
        downloadButton.disabled = true;
        downloadButton.innerHTML = '<span class="btn-text"><i class="fas fa-spinner fa-spin"></i> Generating...</span>';
        
        // Use html2canvas to capture the card
        html2canvas(resultsCard, {
            scale: 2,
            logging: false,
            backgroundColor: 'white'
        }).then(canvas => {
            // Convert to image
            const image = canvas.toDataURL('image/png');
            
            // Create download link
            const link = document.createElement('a');
            link.href = image;
            link.download = `crimson-court-${characterNameElem.textContent.toLowerCase()}.png`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Reset button
            downloadButton.disabled = false;
            downloadButton.innerHTML = '<span class="btn-text"><i class="fas fa-download"></i> Download Results</span>';
            
            // Show a magical sparkle effect
            addMagicalSparkle(downloadButton);
        });
    }
    
    // Reset quiz state
    function resetQuiz() {
        resultsScreen.classList.remove('active');
        introScreen.classList.add('active');
        
        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Add magical reset effect
        addMagicalResetEffect();
    }
    
    // Share modal functions
    function openShareModal() {
        shareModal.classList.add('active');
        addMagicalModalEffect();
    }
    
    function closeShareModal() {
        shareModal.classList.remove('active');
    }
    
    // Share functions
    function shareOnTwitter(e) {
        e.preventDefault();
        const winningCharacter = characterNameElem.textContent;
        const tweetText = `I took the Crimson Court Character Quiz and I'm most like ${winningCharacter}! Find out which heir to the throne you are! #RollWithAdvantage #CrimsonCourt`;
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.href)}`;
        window.open(tweetUrl, '_blank');
    }
    
    function shareOnFacebook(e) {
        e.preventDefault();
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(shareUrl, '_blank');
    }
    
    function shareOnReddit(e) {
        e.preventDefault();
        const winningCharacter = characterNameElem.textContent;
        const title = `I took the Crimson Court Character Quiz and I'm most like ${winningCharacter}!`;
        const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}`;
        window.open(redditUrl, '_blank');
    }
    
    function copyShareLink() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            copyAlert.style.opacity = '1';
            setTimeout(() => {
                copyAlert.style.opacity = '0';
            }, 2000);
        });
    }
    
    // Animation functions
    function animateCharacterSilhouettes() {
        const silhouettes = document.querySelectorAll('.character-silhouette');
        silhouettes.forEach((silhouette, index) => {
            silhouette.style.animationDelay = `${index * 0.2}s`;
        });
    }
    
    function animateAnswerOptions() {
        const options = document.querySelectorAll('.answer-option');
        options.forEach((option, index) => {
            option.style.opacity = '0';
            option.style.transform = 'translateX(-20px)';
            option.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            setTimeout(() => {
                option.style.opacity = '1';
                option.style.transform = 'translateX(0)';
            }, 100 + (index * 100));
        });
    }
    
    function addMagicalSelectionEffect(element) {
        // Create sparkle effect
        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            
            // Random position
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            const size = Math.random() * 8 + 5;
            
            sparkle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                top: ${top}%;
                left: ${left}%;
                background: rgba(195, 10, 61, 0.8);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10;
                animation: sparkleAnimation 0.8s forwards;
            `;
            
            element.appendChild(sparkle);
            
            // Remove after animation
            setTimeout(() => {
                sparkle.remove();
            }, 800);
        }
    }
    
    function animateResults() {
        // Add entry animations to elements
        document.querySelector('.result-header').style.animation = 'fadeInDown 0.8s forwards';
        document.querySelector('.character-portrait').style.animation = 'fadeInLeft 0.8s 0.2s forwards';
        document.querySelector('.character-description').style.animation = 'fadeInRight 0.8s 0.4s forwards';
        document.querySelector('.result-footer').style.animation = 'fadeInUp 0.8s 0.6s forwards';
        document.querySelector('.chart-container').style.animation = 'fadeIn 1s 0.8s forwards';
        document.querySelector('.results-traits').style.animation = 'fadeIn 1s 1s forwards';
        document.querySelector('.results-actions').style.animation = 'fadeIn 1s 1.2s forwards';
        
        // Hide elements initially
        document.querySelector('.character-portrait').style.opacity = '0';
        document.querySelector('.character-description').style.opacity = '0';
        document.querySelector('.result-footer').style.opacity = '0';
        document.querySelector('.chart-container').style.opacity = '0';
        document.querySelector('.results-traits').style.opacity = '0';
        document.querySelector('.results-actions').style.opacity = '0';
        
        // Add animation to match percentage counter
        animateCounter(matchPercentElem, 0, parseInt(matchPercentElem.textContent), 1500);
        
        // Add ribbon to results card
        const resultsCard = document.getElementById('results-card');
        const ribbon = document.createElement('div');
        ribbon.className = 'result-ribbon';
        resultsCard.appendChild(ribbon);
        
        // Add confetti celebration
        createConfetti();
        
        // Apply fun classes to elements
        document.querySelectorAll('.trait-item').forEach(item => {
            item.classList.add('bounce-on-hover');
        });
        
        document.querySelector('.character-portrait').classList.add('wobble-animation');
        document.querySelector('.qr-code-container').classList.add('float-animation');
        
        // Easter egg - double-click on character image for disco mode
        characterImageElem.addEventListener('dblclick', enableDiscoMode);
    }
    
    // Create confetti celebration effect
    function createConfetti() {
        const resultsContainer = document.querySelector('.results-container');
        
        // Create 50 confetti pieces
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                
                // Random position, color and size
                const left = Math.random() * 100;
                const width = Math.random() * 10 + 5;
                const height = Math.random() * 10 + 5;
                const delay = Math.random() * 3;
                
                // Random color based on character colors
                const colors = [
                    'rgba(75, 192, 192, 0.9)',  // Talon
                    'rgba(54, 162, 235, 0.9)',  // Edwinn
                    'rgba(153, 102, 255, 0.9)', // Xanthe
                    'rgba(255, 99, 132, 0.9)',  // Cailynn
                    'rgba(255, 159, 64, 0.9)',  // Marik
                    'rgba(255, 205, 86, 0.9)'   // Via
                ];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                // Random shape
                const shapes = ['circle', 'square', 'triangle'];
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                
                // Apply styles
                confetti.style.left = `${left}%`;
                confetti.style.width = `${width}px`;
                confetti.style.height = `${height}px`;
                confetti.style.backgroundColor = color;
                confetti.style.animationDelay = `${delay}s`;
                
                // Apply different shapes
                if (shape === 'circle') {
                    confetti.style.borderRadius = '50%';
                } else if (shape === 'triangle') {
                    confetti.style.width = '0';
                    confetti.style.height = '0';
                    confetti.style.backgroundColor = 'transparent';
                    confetti.style.borderLeft = `${width/2}px solid transparent`;
                    confetti.style.borderRight = `${width/2}px solid transparent`;
                    confetti.style.borderBottom = `${height}px solid ${color}`;
                }
                
                resultsContainer.appendChild(confetti);
                
                // Remove after animation completes
                setTimeout(() => {
                    confetti.remove();
                }, 4000);
            }, i * 50);
        }
    }
    
    // Easter egg - disco mode
    function enableDiscoMode() {
        const resultsCard = document.getElementById('results-card');
        resultsCard.classList.toggle('disco-mode');
        
        // Play a fun sound if available
        const discoSound = new Audio('assets/sounds/disco.mp3');
        discoSound.volume = 0.3;
        discoSound.play().catch(err => console.log('No disco sound available'));
        
        // Add some extra disco effects
        if (resultsCard.classList.contains('disco-mode')) {
            characterNameElem.innerHTML += ' 🕺💃';
            
            // Change all the chart colors to rainbow colors
            if (window.resultChart) {
                window.resultChart.data.datasets[0].backgroundColor = 'rgba(255, 99, 132, 0.5)';
                window.resultChart.data.datasets[0].borderColor = 'rgba(255, 99, 132, 1)';
                window.resultChart.update();
            }
        } else {
            characterNameElem.innerHTML = characterNameElem.innerHTML.replace(' 🕺💃', '');
            
            // Reset chart colors
            if (window.resultChart) {
                window.resultChart.data.datasets[0].backgroundColor = 'rgba(195, 10, 61, 0.2)';
                window.resultChart.data.datasets[0].borderColor = 'rgba(195, 10, 61, 1)';
                window.resultChart.update();
            }
        }
    }
    
    function animateCounter(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    function addMagicalSparkle(element) {
        // Create sparkles
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'download-sparkle';
                
                // Random position
                const top = Math.random() * 100;
                const left = Math.random() * 100;
                const size = Math.random() * 6 + 3;
                
                sparkle.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    top: ${top}%;
                    left: ${left}%;
                    background: white;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10;
                    box-shadow: 0 0 ${size * 2}px rgba(255, 255, 255, 0.8);
                    animation: downloadSparkle 0.8s forwards;
                `;
                
                element.appendChild(sparkle);
                
                // Remove after animation
                setTimeout(() => {
                    sparkle.remove();
                }, 800);
            }, i * 50);
        }
    }
    
    function addMagicalResetEffect() {
        // Create magical reset animation
        document.body.classList.add('resetting');
        setTimeout(() => {
            document.body.classList.remove('resetting');
        }, 1000);
    }
    
    function addMagicalModalEffect() {
        const modalContent = document.querySelector('.modal-content');
        
        // Add entry animation
        modalContent.style.animation = 'modalEnter 0.5s forwards';
        
        // Create sparkles around the modal
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'modal-sparkle';
                
                // Position around the modal
                const angle = Math.random() * 360;
                const distance = Math.random() * 100 + 50;
                const size = Math.random() * 8 + 4;
                
                // Calculate position
                const radians = angle * (Math.PI / 180);
                const x = Math.cos(radians) * distance;
                const y = Math.sin(radians) * distance;
                
                sparkle.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    top: 50%;
                    left: 50%;
                    transform: translate(${x}px, ${y}px);
                    background: rgba(127, 14, 189, 0.8);
                    border-radius: 50%;
                    pointer-events: none;
                    opacity: 0;
                    box-shadow: 0 0 ${size * 2}px rgba(127, 14, 189, 0.8);
                    animation: modalSparkle 1s forwards;
                `;
                
                shareModal.appendChild(sparkle);
                
                // Remove after animation
                setTimeout(() => {
                    sparkle.remove();
                }, 1000);
            }, i * 50);
        }
    }
    
    // Add keyframe animations if not already in the document
    function addKeyframeAnimations() {
        if (!document.getElementById('quiz-animations')) {
            const style = document.createElement('style');
            style.id = 'quiz-animations';
            style.innerHTML = `
                @keyframes sparkleAnimation {
                    0% {
                        transform: scale(0) rotate(0deg);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1.5) rotate(90deg);
                        opacity: 0;
                    }
                }
                
                @keyframes downloadSparkle {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes modalEnter {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes modalSparkle {
                    0% {
                        transform: translate(${x}px, ${y}px) scale(0);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate(${x}px, ${y}px) scale(1.5);
                        opacity: 0;
                    }
                }
                
                .resetting {
                    animation: resetFlash 1s;
                }
                
                @keyframes resetFlash {
                    0% {
                        filter: brightness(1);
                    }
                    50% {
                        filter: brightness(1.5);
                    }
                    100% {
                        filter: brightness(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Initialize the quiz
    addKeyframeAnimations();
    initQuiz();
});