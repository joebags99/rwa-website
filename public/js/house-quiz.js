/**
 * Roll With Advantage - House Quiz
 * Discover which noble house of Ederia you belong to!
 */

document.addEventListener('DOMContentLoaded', function() {
    // Quiz sections
    const quizIntro = document.getElementById('quiz-intro');
    const quizQuestionsSection = document.getElementById('quiz-questions');
    const nameInputForm = document.getElementById('name-input-form');
    const quizResults = document.getElementById('quiz-results');
    const questionContainer = document.getElementById('question-container');
    
    // Name form elements
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const firstNameError = document.getElementById('firstName-error');
    const lastNameError = document.getElementById('lastName-error');
    
    // Navigation elements
    const startQuizBtn = document.getElementById('start-quiz');
    const prevQuestionBtn = document.getElementById('prev-question');
    const nextQuestionBtn = document.getElementById('next-question');
    const submitNameBtn = document.getElementById('submit-name');
    const retakeQuizBtn = document.getElementById('retake-quiz');
    
    // Progress elements
    const progressFill = document.getElementById('progress-fill');
    const currentQuestionSpan = document.getElementById('current-question');
    const totalQuestionsSpan = document.getElementById('total-questions');
    
    // Results elements
    const houseName = document.getElementById('house-name');
    const houseImage = document.getElementById('house-image');
    const nobleTitle = document.getElementById('noble-title');
    const houseTraits = document.getElementById('house-traits');
    const houseDescription = document.getElementById('house-description');
    const primaryPercentage = document.getElementById('primary-percentage');
    const resultsChart = document.getElementById('results-chart');
    const resultHeader = document.getElementById('result-header');
    const downloadResultBtn = document.getElementById('download-result');
    const shareButtons = document.querySelectorAll('.btn-share');
    
    // Quiz state
    let currentQuestion = 0;
    let userAnswers = [];
    let radarChart = null;
    let userName = {
        firstName: '',
        lastName: ''
    };
    
    // House data
    const houses = {
        falkrest: {
            name: "House Falkrest",
            image: "assets/images/tools/falkrest-shield.png",
            color: "#4A9744", // Green
            traits: [
                "Exploration and adventure",
                "Spirit of discovery",
                "Courage and adaptability",
                "Affinity for distant lands"
            ],
            description: "The Falkrests are known throughout Ederia as intrepid explorers and adventurers. Their territories in the eastern highlands serve as a launching point for expeditions into uncharted lands. Falkrests are natural scouts and reconnaissance experts, renowned for their courage and adaptability. Their motto, 'Beyond the Horizon,' speaks to their drive to push boundaries and discover what lies beyond established frontiers."
        },
        veltaris: {
            name: "House Veltaris",
            image: "assets/images/tools/veltaris-shield.png",
            color: "#2A6BC2", // Blue
            traits: [
                "Naval and maritime excellence",
                "Seafaring prowess",
                "Defense of coastal regions",
                "Mastery of trade routes"
            ],
            description: "The Veltaris family commands the seas from their coastal stronghold. Their naval expertise has secured Ederia's maritime borders for generations, and their trading ships are known in ports across the world. Veltaris nobles are proud, courageous in the face of the unknown, and fiercely loyal to their allies. They understand that true strength comes not from conquest, but from building networks that span oceans."
        },
        thornefield: {
            name: "House Thornefield",
            image: "assets/images/tools/thornefield-shield.png",
            color: "#D8B968", // Gold
            traits: [
                "Agricultural expertise",
                "Resourcefulness and hard work",
                "Stewardship of the land",
                "Practical problem-solving"
            ],
            description: "The breadbasket of Ederia, House Thornefield controls the kingdom's most fertile farmlands. Their agricultural expertise ensures that the realm never wants for food, making them indispensable to the crown. Thornefields value hard work, resourcefulness, and practical solutions. They understand that true wealth lies in the land and the people who tend it, not in gold and jewels. Their practicality and commitment to stewardship has earned them widespread respect."
        },
        astralor: {
            name: "House Astralor",
            image: "assets/images/tools/astralor-shield.png",
            color: "#40D0D0", // Teal
            traits: [
                "Arcane knowledge and magic",
                "Pursuit of wisdom",
                "Magical innovation",
                "Guardians of ancient secrets"
            ],
            description: "From their mystical stronghold of Tomehold, House Astralor has studied the arcane arts for centuries. Their magical innovations and research have shaped Ederia's understanding of the universe. Astralors value knowledge above all else and believe that with great magical power comes great responsibility. They serve as both advisors and protectors, using their arcane talents to safeguard the realm from supernatural threats that common folk barely comprehend."
        },
        eldran: {
            name: "House Eldran",
            image: "assets/images/tools/eldran-shield.png",
            color: "#9F80EB", // Purple
            traits: [
                "Wealth and political influence",
                "Noble lineage and tradition",
                "Strategic alliances",
                "Economic mastery"
            ],
            description: "The oldest and perhaps most influential of Ederia's noble houses, the Eldrans have been close to the throne since the kingdom's founding. Their vast wealth and extensive network of alliances give them unparalleled political influence. Eldrans honor their bloodline above all else and ensure their house's position through careful political maneuvering and strategic marriages. While some see them as calculating, Eldrans understand that stability requires a firm hand guiding from behind the scenes."
        },
        emberlyn: {
            name: "House Emberlyn",
            image: "assets/images/tools/emberlyn-shield.png",
            color: "#DD6C6C", // Red
            traits: [
                "Faith and spiritual guidance",
                "Masterful craftsmanship",
                "Blend of sacred and secular",
                "Moral leadership"
            ],
            description: "House Emberlyn stands at the intersection of faith and forge. From their mountain stronghold of Faithspire, they combine spiritual leadership with unparalleled craftsmanship. The Emberlyns are keepers of 'the Flame,' a sacred force they believe guides both their spiritual practices and their legendary smithing. Their forge-temples produce both weapons of war and instruments of peace, always with an eye toward serving a higher purpose than mere practicality or profit."
        }
    };
    
    // Quiz questions and answers from document #16
    const quizQuestions = [
        {
            question: "A band of raiders threatens one of your villages. How do you respond?",
            answers: [
                { text: "Send our fastest ships to cut off their escape by sea", house: "veltaris" },
                { text: "Reinforce farmland walls and organize a militia from local workers", house: "thornefield" },
                { text: "Gather scouts and track the raiders' movements, then strike swiftly", house: "falkrest" },
                { text: "Use our magic to create protective wards and reveal the raiders' hideout", house: "astralor" },
                { text: "Leverage our wealth to hire veteran mercenaries and secure the region", house: "eldran" },
                { text: "Pray for guidance, then forge weapons and rally faith-driven defenders", house: "emberlyn" }
            ]
        },
        {
            question: "You are invited to a council of nobles to negotiate a new trade alliance. What is your main concern?",
            answers: [
                { text: "Securing maritime routes and ensuring our navy's supremacy at sea", house: "veltaris" },
                { text: "Protecting fair trade for our valuable harvests and controlling grain prices", house: "thornefield" },
                { text: "Mapping potential new routes and exploring unknown lands for better commerce", house: "falkrest" },
                { text: "Safeguarding arcane secrets and ensuring any deal respects our magical authority", house: "astralor" },
                { text: "Preserving our family's influence and ensuring we remain the wealthiest stakeholders", house: "eldran" },
                { text: "Maintaining moral standards and ensuring the alliance serves the faith as well", house: "emberlyn" }
            ]
        },
        {
            question: "You inherit a mysterious artifact said to hold great power. What do you do first?",
            answers: [
                { text: "Test it at sea, perhaps it can aid in defending our coastal strongholds", house: "veltaris" },
                { text: "Study its practical uses, especially if it could improve farmland or harvests", house: "thornefield" },
                { text: "Examine it for any link to distant realms, then plan a voyage to learn more", house: "falkrest" },
                { text: "Consult forbidden tomes in Tomehold to reveal its hidden magical properties", house: "astralor" },
                { text: "Guard it in our vault, allowing only trusted elites to access it for political gain", house: "eldran" },
                { text: "Attempt a sacred blessing at our forge-temple to see if it can serve the faith", house: "emberlyn" }
            ]
        },
        {
            question: "Word spreads of a scandal in your house that could harm its reputation. How do you handle it?",
            answers: [
                { text: "Swiftly confront rumor with evidence of our honorable actions at sea", house: "veltaris" },
                { text: "Contain the gossip by controlling who has access to our farmlands and markets", house: "thornefield" },
                { text: "Seek the truth directly, possibly traveling to distant lands where the rumor began", house: "falkrest" },
                { text: "Use magic to uncover the source, then let knowledge dispel any falsehoods", house: "astralor" },
                { text: "Deploy our influence to suppress damaging whispers and bargain for secrecy if necessary", house: "eldran" },
                { text: "Encourage repentance or proof of innocence before the faithful, letting sincerity speak", house: "emberlyn" }
            ]
        },
        {
            question: "A rival lord insults your house during a grand feast. How do you respond in the moment?",
            answers: [
                { text: "Offer a proud toast praising our naval triumphs and hinting at our strength on open waters", house: "veltaris" },
                { text: "Calmly remind them how reliant everyone is on our harvests, letting them reflect on that fact", house: "thornefield" },
                { text: "Laugh it off and regale the table with tales of our explorers' daring feats", house: "falkrest" },
                { text: "Politely correct them with a pointed demonstration of subtle magical prowess", house: "astralor" },
                { text: "Respond with poise, reminding them of our lineage and wealth, leaving no doubt who holds power", house: "eldran" },
                { text: "Show quiet composure, trusting that true honor is proven through faith and deeds", house: "emberlyn" }
            ]
        },
        {
            question: "A traveling merchant offers you a deal that seems too good to be true. How do you proceed?",
            answers: [
                { text: "Inspect the goods thoroughly and rely on our maritime trade expertise to spot tricks", house: "veltaris" },
                { text: "Evaluate how it might affect crop supplies and gold flow before making a decision", house: "thornefield" },
                { text: "Ask for a chance to accompany the merchant on their route to learn the source firsthand", house: "falkrest" },
                { text: "Use spells of truth-seeing to verify legitimacy before finalizing the bargain", house: "astralor" },
                { text: "Dispatch our financial advisors to negotiate a more secure arrangement", house: "eldran" },
                { text: "Seek guidance in prayer and craftsmanship to test the merchant's honesty", house: "emberlyn" }
            ]
        },
        {
            question: "You are tasked with mentoring a young noble. Which principle do you emphasize most?",
            answers: [
                { text: "Courage in the face of the unknown and loyalty to those who sail alongside you", house: "veltaris" },
                { text: "Hard work, resourcefulness, and the importance of tending to your people", house: "thornefield" },
                { text: "The spirit of adventure and the drive to push beyond established boundaries", house: "falkrest" },
                { text: "The power of knowledge and the responsibility that comes with wielding it", house: "astralor" },
                { text: "Honor your bloodline, build alliances, and ensure your house remains at the pinnacle", house: "eldran" },
                { text: "Devotion to a higher cause, balanced with the skill to craft and create for the good of all", house: "emberlyn" }
            ]
        },
        {
            question: "A mysterious new cult arises in your kingdom, attracting commoners and nobles alike. How do you react?",
            answers: [
                { text: "Patrol the coast to ensure they do not threaten trade routes or plan subversive activities", house: "veltaris" },
                { text: "Monitor how it affects local farmers, ensuring production remains stable", house: "thornefield" },
                { text: "Investigate the cult's origin, possibly journeying to distant lands to uncover its roots", house: "falkrest" },
                { text: "Research their doctrines, compare them to known spells, and guard against dark magic", house: "astralor" },
                { text: "Use our networks to learn if this cult has political aims and neutralize any threat", house: "eldran" },
                { text: "Confront them through the lens of established faith, testing their beliefs for danger or heresy", house: "emberlyn" }
            ]
        },
        {
            question: "You have the opportunity to reshape regional politics through an arranged marriage. What is your goal?",
            answers: [
                { text: "Strengthen our navy by securing access to new shipyards or trade harbors", house: "veltaris" },
                { text: "Guarantee reliable grain sales and farmland expansion, reinforcing our economic position", house: "thornefield" },
                { text: "Gain the freedom to explore newly discovered realms with the backing of allied forces", house: "falkrest" },
                { text: "Build a bridge to shared arcane knowledge, forming a partnership grounded in magic", house: "astralor" },
                { text: "Unite two powerful bloodlines, increasing our house's hold on the throne", house: "eldran" },
                { text: "Merge crafts and creed, ensuring both forging tradition and sacred faith endure", house: "emberlyn" }
            ]
        },
        {
            question: "A trusted servant reveals a hidden talent that could shift the balance of power in the realm. How do you act on this discovery?",
            answers: [
                { text: "Invite them to sail with our fleet and develop their abilities to defend our shores", house: "veltaris" },
                { text: "Offer them a role managing farmland resources so their talents help our crops thrive", house: "thornefield" },
                { text: "Encourage them to join our expeditions, letting their skills be tested in uncharted lands", house: "falkrest" },
                { text: "Offer them tutelage in Tomehold, exploring the possibility of arcane potential", house: "astralor" },
                { text: "Secure their loyalty with wealth and status, ensuring they serve our grand design", house: "eldran" },
                { text: "Guide them to Faithspire to refine their gifts in a way that honors the Flame", house: "emberlyn" }
            ]
        },
        {
            question: "A devastating storm wreaks havoc across the kingdom, destroying crops and damaging buildings. How do you lead relief efforts?",
            answers: [
                { text: "Send ships loaded with supplies to coastal and inland towns, using our seafaring routes", house: "veltaris" },
                { text: "Quickly replant devastated fields and distribute leftover reserves from our own stock", house: "thornefield" },
                { text: "Scout nearby regions for untouched resources and coordinate safe paths for caravans", house: "falkrest" },
                { text: "Employ weather manipulation spells where possible, and heal the afflicted with arcane arts", house: "astralor" },
                { text: "Funnel wealth into reconstruction projects while keeping our house's influence strong", house: "eldran" },
                { text: "Establish spiritual shelters and craft essential tools in our forge-temple to aid survivors", house: "emberlyn" }
            ]
        },
        {
            question: "A renowned scholar arrives, claiming to have discovered the secret to eternal youth. How do you respond?",
            answers: [
                { text: "Investigate their claims and see if this knowledge has maritime applications or hidden dangers", house: "veltaris" },
                { text: "Determine whether it can improve farming productivity or threaten our land's resources", house: "thornefield" },
                { text: "Consider traveling to distant lands where such a discovery might have originated", house: "falkrest" },
                { text: "Compare their knowledge to our archives in Tomehold, testing its legitimacy through magic", house: "astralor" },
                { text: "Evaluate the potential for political gain while ensuring our house remains supreme", house: "eldran" },
                { text: "Measure it against the teachings of the Flame to see if it aligns with faith or defies the divine", house: "emberlyn" }
            ]
        },
        {
            question: "A festival in the capital calls for each house to present a cultural showcase. What do you highlight?",
            answers: [
                { text: "Dazzle the audience with sea shanties and feats of naval prowess", house: "veltaris" },
                { text: "Exhibit a grand harvest feast and share the bounty of our farmland", house: "thornefield" },
                { text: "Perform daring demonstrations of agility and recount tales of far-off lands", house: "falkrest" },
                { text: "Display arcane illusions and teach visitors about the power of knowledge", house: "astralor" },
                { text: "Unveil lavish historical artifacts that emphasize our lineage and wealth", house: "eldran" },
                { text: "Conduct a ceremonial forging that blends sacred rites with masterful craftsmanship", house: "emberlyn" }
            ]
        },
        {
            question: "You discover that a lesser noble has been mistreating villagers in your domain. How do you address the situation?",
            answers: [
                { text: "Order a swift inquiry and, if found guilty, demand restitution and strict oversight", house: "veltaris" },
                { text: "Reassign the noble's land management and let local farmers speak freely about abuses", house: "thornefield" },
                { text: "Personally confront them, threatening exile if they fail to respect those under their care", house: "falkrest" },
                { text: "Expose their deeds in the court and use arcane methods to ensure justice is served", house: "astralor" },
                { text: "Leverage political pressure to remove their power, reinforcing our reputation for fairness", house: "eldran" },
                { text: "Call them before the faith's authority to atone and mend what has been harmed", house: "emberlyn" }
            ]
        },
        {
            question: "Tensions escalate between two neighboring kingdoms and war seems imminent. What stance do you take?",
            answers: [
                { text: "Secure strategic sea lanes and prepare our navy for defense, while trying to broker peace", house: "veltaris" },
                { text: "Stockpile food and fortify farmland to ensure no starvation occurs on our soil", house: "thornefield" },
                { text: "Scout borderlands for weaknesses or opportunities, always ready to adapt", house: "falkrest" },
                { text: "Offer diplomatic mediation backed by magical deterrents, warning both sides of the arcane cost", house: "astralor" },
                { text: "Position ourselves to gain economically or politically, possibly funding whichever side suits our interests", house: "eldran" },
                { text: "Urge a peaceful resolution and provide spiritual guidance, forging arms only if absolutely necessary", house: "emberlyn" }
            ]
        }
    ];
    
    // Shuffle array function (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Initialize the quiz
    function initQuiz() {
        console.log("Initializing House quiz with", quizQuestions.length, "questions");
        
        // Set the total number of questions
        totalQuestionsSpan.textContent = quizQuestions.length;
        
        // Shuffle answers for each question
        quizQuestions.forEach(question => {
            question.answers = shuffleArray([...question.answers]);
        });
        
        // Generate all questions HTML
        quizQuestions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = `question ${index === 0 ? 'active' : ''}`;
            questionDiv.dataset.index = index;
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = q.question;
            
            const answersDiv = document.createElement('div');
            answersDiv.className = 'answers';
            
            q.answers.forEach((answer, answerIndex) => {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer-option';
                answerDiv.dataset.house = answer.house;
                answerDiv.dataset.index = answerIndex;
                
                const answerText = document.createElement('div');
                answerText.className = 'answer-text';
                answerText.textContent = answer.text;
                
                answerDiv.appendChild(answerText);
                
                answerDiv.addEventListener('click', () => {
                    // Deselect all other answers
                    document.querySelectorAll(`.question[data-index="${index}"] .answer-option`).forEach(option => {
                        option.classList.remove('selected');
                    });
                    
                    // Select this answer
                    answerDiv.classList.add('selected');
                    
                    // Store the answer
                    userAnswers[index] = answer.house;
                    console.log(`User selected answer for question ${index + 1}: ${answer.house}`);
                    
                    // Enable next button
                    nextQuestionBtn.disabled = false;
                });
                
                answersDiv.appendChild(answerDiv);
            });
            
            questionDiv.appendChild(questionText);
            questionDiv.appendChild(answersDiv);
            
            questionContainer.appendChild(questionDiv);
        });
        
        // Event listeners
        startQuizBtn.addEventListener('click', startQuiz);
        prevQuestionBtn.addEventListener('click', goToPreviousQuestion);
        nextQuestionBtn.addEventListener('click', handleNextButton);
        submitNameBtn.addEventListener('click', submitNameForm);
        retakeQuizBtn.addEventListener('click', retakeQuiz);
        downloadResultBtn.addEventListener('click', downloadResult);
        
        // Input validation for name form
        firstNameInput.addEventListener('input', () => {
            validateInput(firstNameInput, firstNameError, 'Please enter your first name');
        });
        
        lastNameInput.addEventListener('input', () => {
            validateInput(lastNameInput, lastNameError, 'Please enter your last name');
        });
        
        // Share buttons
        shareButtons.forEach(button => {
            button.addEventListener('click', shareResult);
        });
    }
    
    // Validate input field
    function validateInput(input, errorElement, errorMessage) {
        if (input.value.trim() === '') {
            errorElement.textContent = errorMessage;
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }
    
    // Handle next button click - either go to next question or show name form
    function handleNextButton() {
        console.log(`Next button clicked, current question: ${currentQuestion + 1} of ${quizQuestions.length}`);
        
        // If this is the last question, show name input form
        if (currentQuestion === quizQuestions.length - 1) {
            console.log("This is the last question, showing name input form");
            showNameForm();
            return;
        }
        
        // Otherwise, go to the next question
        currentQuestion++;
        updateQuestionDisplay();
    }
    
    // Start the quiz
    function startQuiz() {
        quizIntro.style.display = 'none';
        quizQuestionsSection.style.display = 'block';
        
        // Initialize userAnswers array with empty values
        userAnswers = Array(quizQuestions.length).fill(null);
        
        // Reset name
        userName = {
            firstName: '',
            lastName: ''
        };
        
        // Show the first question
        updateQuestionDisplay();
    }
    
    // Go to the previous question
    function goToPreviousQuestion() {
        if (currentQuestion > 0) {
            currentQuestion--;
            updateQuestionDisplay();
        }
    }
    
    // Show the name input form
    function showNameForm() {
        quizQuestionsSection.style.display = 'none';
        nameInputForm.style.display = 'block';
        
        // Reset error messages
        firstNameError.textContent = '';
        lastNameError.textContent = '';
        
        // Focus on first name input
        firstNameInput.focus();
    }
    
    // Submit name form
    function submitNameForm() {
        const isFirstNameValid = validateInput(firstNameInput, firstNameError, 'Please enter your first name');
        const isLastNameValid = validateInput(lastNameInput, lastNameError, 'Please enter your last name');
        
        if (isFirstNameValid && isLastNameValid) {
            userName.firstName = firstNameInput.value.trim();
            userName.lastName = lastNameInput.value.trim();
            
            console.log(`Name submitted: ${userName.firstName} ${userName.lastName}`);
            showResults();
        }
    }
    
    // Update the question display
    function updateQuestionDisplay() {
        // Hide all questions
        document.querySelectorAll('.question').forEach(q => {
            q.classList.remove('active');
        });
        
        // Show current question
        document.querySelector(`.question[data-index="${currentQuestion}"]`).classList.add('active');
        
        // Update progress - Adding 1 to currentQuestion since we display questions starting at 1 (not 0)
        currentQuestionSpan.textContent = currentQuestion + 1;
        progressFill.style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;
        
        console.log(`Displaying question ${currentQuestion + 1} of ${quizQuestions.length}`);
        
        // Update button states
        prevQuestionBtn.disabled = currentQuestion === 0;
        
        // Check if we have an answer for this question
        if (userAnswers[currentQuestion]) {
            // Select the corresponding answer option
            document.querySelectorAll(`.question[data-index="${currentQuestion}"] .answer-option`).forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.house === userAnswers[currentQuestion]) {
                    option.classList.add('selected');
                }
            });
            
            nextQuestionBtn.disabled = false;
        } else {
            nextQuestionBtn.disabled = true;
        }
        
        // Change text of next button on the last question
        if (currentQuestion === quizQuestions.length - 1) {
            nextQuestionBtn.innerHTML = '<span class="btn-text"><i class="fas fa-scroll"></i> Complete Quiz</span>';
            console.log("On last question, showing 'Complete Quiz' button");
        } else {
            nextQuestionBtn.innerHTML = '<span class="btn-text">Next <i class="fas fa-arrow-right"></i></span>';
        }
    }
    
    // Calculate the results
    function calculateResults() {
        console.log("Calculating results based on user answers:", userAnswers);
        
        // Count the occurrences of each house
        const results = {
            falkrest: 0,
            veltaris: 0,
            thornefield: 0,
            astralor: 0,
            eldran: 0,
            emberlyn: 0
        };
        
        userAnswers.forEach(house => {
            if (house) {
                results[house]++;
            }
        });
        
        console.log("Raw house counts:", results);
        
        // Convert to percentages
        const percentages = {};
        const totalAnswered = userAnswers.filter(Boolean).length;
        
        for (const [house, count] of Object.entries(results)) {
            percentages[house] = Math.round((count / totalAnswered) * 100);
        }
        
        // Get the house with highest percentage
        let topHouse = null;
        let topPercentage = 0;
        
        for (const [house, percentage] of Object.entries(percentages)) {
            if (percentage > topPercentage) {
                topHouse = house;
                topPercentage = percentage;
            }
        }
        
        return {
            topHouse,
            topPercentage,
            percentages
        };
    }
    
    // Show the results
    function showResults() {
        console.log("showResults function called");
        const results = calculateResults();
        console.log("Calculated results:", results);
        
        // Hide name form, show results
        nameInputForm.style.display = 'none';
        quizResults.style.display = 'block';
        
        // Update main result
        const house = houses[results.topHouse];
        console.log("Top house:", house.name);
        houseName.textContent = house.name;
        houseImage.src = house.image;
        houseImage.alt = house.name;
        primaryPercentage.textContent = `${results.topPercentage}%`;
        
        // Set house-specific colors
        resultHeader.className = `result-header house-${results.topHouse}`;
        document.documentElement.style.setProperty('--current-house-color', house.color);
        
        // Set noble title
        nobleTitle.textContent = `Ser ${userName.firstName} of House ${userName.lastName} is a proud banner bearer of ${house.name}`;
        
        // Clear traits list and add new traits
        houseTraits.innerHTML = '';
        house.traits.forEach(trait => {
            const li = document.createElement('li');
            li.textContent = trait;
            houseTraits.appendChild(li);
        });
        
        // Set description
        houseDescription.textContent = house.description;
        
        // Create radar chart - wrapped in setTimeout to ensure the container is visible
        setTimeout(() => {
            createRadarChart(results.percentages, results.topHouse);
        }, 100);
        
        // Scroll to top of results
        quizResults.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Create the radar chart
    function createRadarChart(percentages, topHouse) {
        // Destroy previous chart if it exists
        if (radarChart) {
            radarChart.destroy();
        }
        
        // Get the container dimensions
        const container = document.querySelector('.radar-chart-container');
        const containerWidth = container.clientWidth;
        const containerHeight = 360; // Fixed height to prevent excessive growth
        
        // Set the canvas size explicitly
        const canvas = document.getElementById('results-chart');
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = containerHeight + 'px';
        canvas.style.maxHeight = '400px';
        
        // Get the house color for the chart
        const houseColor = houses[topHouse].color;

        // Use abbreviated house names for chart labels to prevent overlap
        const chartLabels = [
            'Falkrest',
            'Veltaris',
            'Thornefield',
            'Astralor',
            'Eldran',
            'Emberlyn'
        ];
        
        // Prepare chart data
        const chartData = {
            labels: chartLabels,
            datasets: [
                {
                    label: 'House Match',
                    data: [
                        percentages.falkrest,
                        percentages.veltaris,
                        percentages.thornefield,
                        percentages.astralor,
                        percentages.eldran,
                        percentages.emberlyn
                    ],
                    backgroundColor: `${houseColor}33`, // Add alpha for transparency
                    borderColor: houseColor,
                    pointBackgroundColor: houseColor,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: houseColor
                }
            ]
        };
        
        // Chart configuration
        const config = {
            type: 'radar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                elements: {
                    line: {
                        borderWidth: 3
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
                            stepSize: 20,
                            backdropColor: 'transparent',
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                size: 12
                            }
                        },
                        pointLabels: {
                            font: {
                                size: 14,
                                family: "'Cinzel', serif",
                                weight: 'bold'
                            },
                            color: '#333',
                            padding: 10 // Add padding between labels and chart
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
                                return context.raw + '% match with House ' + chartLabels[context.dataIndex];
                            }
                        }
                    }
                }
            }
        };
        
        // Create the chart
        radarChart = new Chart(resultsChart, config);
    }
    
    // Retake the quiz
    function retakeQuiz() {
        // Reset quiz state
        currentQuestion = 0;
        userAnswers = Array(quizQuestions.length).fill(null);
        userName = {
            firstName: '',
            lastName: ''
        };
        
        // Reset form inputs
        firstNameInput.value = '';
        lastNameInput.value = '';
        
        // Reset UI
        document.querySelectorAll('.answer-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Reset progress
        progressFill.style.width = '0%';
        currentQuestionSpan.textContent = '1';
        
        // Show intro, hide results
        quizResults.style.display = 'none';
        quizIntro.style.display = 'block';
        
        // Scroll to top
        quizIntro.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Download the result card
    function downloadResult() {
        // Create a larger canvas (1920x1080)
        const canvas = document.getElementById('result-card-canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        // Get the current results
        const results = calculateResults();
        const house = houses[results.topHouse];
        
        // Clear canvas with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw house-colored header background (taller for the larger canvas)
        const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        headerGradient.addColorStop(0, house.color);
        headerGradient.addColorStop(1, shade(house.color, -20)); // Darker shade of the house color
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, canvas.width, 150);
        
        // Draw header text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 70px Cinzel';
        ctx.textAlign = 'center';
        ctx.fillText('YOUR HOUSE OF EDERIA MATCH', canvas.width / 2, 95);
        
        // Draw the rest of the background
        ctx.fillStyle = '#F8F8F8';  // Light background
        ctx.fillRect(0, 150, canvas.width, canvas.height - 150);
        
        // Add subtle texture to background
        ctx.globalAlpha = 0.03;
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * canvas.width;
            const y = 150 + Math.random() * (canvas.height - 150);
            const size = Math.random() * 60 + 20;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y);
            ctx.strokeStyle = house.color;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
        
        // Draw dividing line between header and content
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(canvas.width, 150);
        ctx.strokeStyle = house.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Load house shield image
        const houseImg = new Image();
        houseImg.crossOrigin = "Anonymous";
        
        houseImg.onload = function() {
            // Create a clearer two-column layout with more defined separation
            // Make the left column narrower to ensure more room for the right
            const leftCol = {
                x: 100,
                width: 800
            };
            
            const rightCol = {
                x: 1000, // Increased distance for clearer separation
                width: 820
            };
            
            // Draw house name with larger font - moved up to create more vertical space
            ctx.fillStyle = house.color;
            ctx.font = 'bold 120px Cinzel';
            ctx.textAlign = 'left';
            ctx.fillText(house.name, leftCol.x, 270);
            
            // Draw match percentage right below the name
            ctx.font = 'bold 80px Cinzel';
            ctx.fillText(`${results.topPercentage}% Match`, leftCol.x, 360);
            
            // Draw shield image below name and percentage
            const imgSize = 300;
            ctx.drawImage(houseImg, leftCol.x, 390, imgSize, imgSize);
            
            // Draw noble title next to the shield
            ctx.fillStyle = '#333';
            ctx.font = 'bold 30px "EB Garamond"';
            
            // Position the title next to the shield
            ctx.textAlign = 'left';
            ctx.fillText(`Ser ${userName.firstName} of House ${userName.lastName}`, leftCol.x + 320, 440);
            ctx.fillText(`is a proud banner bearer of House ${results.topHouse.charAt(0).toUpperCase() + results.topHouse.slice(1)}`, leftCol.x + 320, 480);
            
            // Add a separator line after noble title and shield
            const titleEndY = 520;
            ctx.beginPath();
            ctx.moveTo(leftCol.x, titleEndY);
            ctx.lineTo(leftCol.x + leftCol.width - 80, titleEndY);
            ctx.strokeStyle = `${house.color}50`;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw traits with larger font
            ctx.font = '30px "EB Garamond"';
            
            house.traits.forEach((trait, index) => {
                ctx.fillText(`• ${trait}`, leftCol.x, titleEndY + 60 + (index * 40));
            });
            
            // Add separator after traits
            const traitsEndY = titleEndY + 60 + (house.traits.length * 40) + 20;
            ctx.beginPath();
            ctx.moveTo(leftCol.x, traitsEndY);
            ctx.lineTo(leftCol.x + leftCol.width - 80, traitsEndY);
            ctx.strokeStyle = `${house.color}50`;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw description with text wrapping - start earlier and use more space
            const description = house.description;
            const descStart = traitsEndY + 40;
            const lineHeight = 38;
            const maxWidth = leftCol.width - 40;
            
            ctx.font = '28px "EB Garamond"';
            // Use updated text wrapping that ensures all text fits
            wrapTextInArea(ctx, description, leftCol.x, descStart, maxWidth, lineHeight, canvas.height - 80);
            
            // Add strong vertical divider between columns
            ctx.beginPath();
            ctx.moveTo(rightCol.x - 80, 180);
            ctx.lineTo(rightCol.x - 80, canvas.height - 80);
            ctx.strokeStyle = `${house.color}40`;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw radar chart on the right side
            const radarChartImage = document.getElementById('results-chart');
            
            // We need to wait for the radar chart to be rendered
            setTimeout(() => {
                // Add "YOUR ALIGNMENT WITH ALL HOUSES" title - positioned CLEARLY below house name
                ctx.fillStyle = '#1a365d';
                ctx.font = 'bold 44px Cinzel';
                ctx.textAlign = 'center';
                ctx.fillText('YOUR ALIGNMENT WITH ALL HOUSES', rightCol.x + 350, 270);
                
                // Draw the radar chart - make it large but keep it within right column
                ctx.drawImage(radarChartImage, rightCol.x, 330, 700, 700);
                
                // Draw website link at bottom
                ctx.fillStyle = '#333';
                ctx.font = 'italic 28px "EB Garamond"';
                ctx.textAlign = 'center';
                ctx.fillText('Discover your noble house at rollwithadvantage.com', canvas.width / 2, canvas.height - 40);
                
                // Create download link
                const dataURL = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `House-${results.topHouse}-${userName.lastName}.png`;
                link.click();
            }, 300); // Delay to ensure chart is rendered
        };
        
        houseImg.src = house.image;
        houseImg.onerror = function() {
            console.error("Failed to load house image");
            // Fallback if image fails to load
            ctx.fillStyle = '#DDD';
            ctx.fillRect(100, 390, 300, 300);
            ctx.fillStyle = house.color;
            ctx.font = 'bold 80px Cinzel';
            ctx.fillText(house.name[0], 250, 550);
            
            // Continue with the rest of the rendering
        };
    }
    
    /**
     * Improved text wrapping function that ensures text fits within vertical bounds
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to wrap
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} maxWidth - Maximum width per line
     * @param {number} lineHeight - Height between lines
     * @param {number} maxY - Maximum Y position (to prevent overflow)
     */
    function wrapTextInArea(ctx, text, x, y, maxWidth, lineHeight, maxY) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            // Check if we need to wrap to the next line
            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
                
                // Check if we're approaching the bottom boundary
                if (currentY + lineHeight > maxY) {
                    // Add ellipsis to indicate truncated text
                    let ellipsisLine = line;
                    // Truncate and add ellipsis if needed
                    while (ctx.measureText(ellipsisLine + '...').width > maxWidth) {
                        ellipsisLine = ellipsisLine.substring(0, ellipsisLine.length - 1);
                    }
                    ctx.fillText(ellipsisLine + '...', x, currentY);
                    return; // Stop rendering text
                }
            } else {
                line = testLine;
            }
        }
        
        // Draw any remaining text
        if (currentY <= maxY) {
            ctx.fillText(line, x, currentY);
        }
    }
    
    // Helper function to darken or lighten a color
    function shade(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);
        
        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);
        
        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;
        
        R = Math.max(0, R);
        G = Math.max(0, G);
        B = Math.max(0, B);
        
        const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));
        
        return "#" + RR + GG + BB;
    }
    
    // Share the result
    function shareResult(event) {
        const platform = event.currentTarget.dataset.platform;
        const results = calculateResults();
        const house = houses[results.topHouse];
        
        const text = `I am Ser ${userName.firstName} of House ${userName.lastName}, a ${results.topPercentage}% match with ${house.name} of Ederia! Take the quiz to discover your noble house:`;
        const url = 'https://rollwithadvantage.com/house-quiz.html';
        
        switch (platform) {
            case 'instagram':
                // For Instagram, suggest downloading + copying caption
                navigator.clipboard.writeText(`${text} ${url}`).then(() => {
                    alert('Caption copied to clipboard! First download your result card, then share it on Instagram with this caption.');
                    // Automatically trigger the download
                    downloadResult();
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                    alert('Please download your result card and share it on Instagram with your match details.');
                });
                break;
                
            case 'facebook':
                // Download first, then direct to Facebook share dialog
                alert('Your result card will download first, then you can upload it directly to Facebook!');
                downloadResult();
                
                // After a short delay, open Facebook sharing dialog
                setTimeout(() => {
                    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
                    window.open(shareUrl, '_blank', 'width=600,height=450');
                }, 1000);
                break;
                
            case 'discord':
                // For Discord, download + copy message
                navigator.clipboard.writeText(`${text} ${url}`).then(() => {
                    alert('Text copied to clipboard! Your result card will download now. You can upload both to Discord.');
                    downloadResult();
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                    alert('Please download your result card and share it on Discord with your match details.');
                });
                break;
        }
    }
    
    // Initialize the quiz
    initQuiz();
    
    // Enhance visual effects after loading
    window.addEventListener('load', function() {
        if (typeof createMagicalElements === 'function') {
            const quizContainer = document.querySelector('.quiz-container');
            createMagicalElements(quizContainer, 'sparkle', 10);
        }
    });
});