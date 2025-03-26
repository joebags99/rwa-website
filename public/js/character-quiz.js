/**
 * Roll With Advantage - Character Quiz
 * Discover which Crimson Court character you're most like!
 */

document.addEventListener('DOMContentLoaded', function() {
    // Quiz sections
    const quizIntro = document.getElementById('quiz-intro');
    const quizQuestionsSection = document.getElementById('quiz-questions');
    const quizResults = document.getElementById('quiz-results');
    const questionContainer = document.getElementById('question-container');
    
    // Navigation elements
    const startQuizBtn = document.getElementById('start-quiz');
    const prevQuestionBtn = document.getElementById('prev-question');
    const nextQuestionBtn = document.getElementById('next-question');
    const retakeQuizBtn = document.getElementById('retake-quiz');
    
    // Progress elements
    const progressFill = document.getElementById('progress-fill');
    const currentQuestionSpan = document.getElementById('current-question');
    const totalQuestionsSpan = document.getElementById('total-questions');
    
    // Results elements
    const characterName = document.getElementById('character-name');
    const characterImage = document.getElementById('character-image');
    const characterTraits = document.getElementById('character-traits');
    const characterDescription = document.getElementById('character-description');
    const primaryPercentage = document.getElementById('primary-percentage');
    const resultsChart = document.getElementById('results-chart');
    const downloadResultBtn = document.getElementById('download-result');
    const shareButtons = document.querySelectorAll('.btn-share');
    
    // Quiz state
    let currentQuestion = 0;
    let userAnswers = [];
    let radarChart = null;
    
    // Character data
    const characters = {
        talon: {
            name: "Talon",
            image: "assets/images/tools/chibi_talon.png",
            traits: [
                "Diplomatic & Compassionate",
                "Values peace and understanding",
                "Prioritizes the wellbeing of the people",
                "Open to different perspectives"
            ],
            description: "Talon is a noble diplomat who believes in the power of dialogue and compassion. They approach leadership with a focus on unity and peace, always considering how their actions affect the common folk. With a natural talent for mediation, Talon seeks to heal rifts rather than exploit them."
        },
        edwinn: {
            name: "Edwinn",
            image: "assets/images/tools/chibi_edwinn.png",
            traits: [
                "Healer & Helper",
                "Seeks peaceful resolutions",
                "Values kindness and respect",
                "Reluctant ruler"
            ],
            description: "Edwinn is a natural healer whose first instinct is to help others. Though they may not have sought power, their compassionate leadership style and dedication to service make them beloved by many. Edwinn believes that true authority comes from earning trust through kindness and demonstrating respect for all."
        },
        xanthe: {
            name: "Xanthe",
            image: "assets/images/tools/chibi_xanthe.png",
            traits: [
                "Decisive & Strategic",
                "Values efficiency and results",
                "Willing to make difficult choices",
                "Believes in strong leadership"
            ],
            description: "Xanthe is a calculating strategist who believes in decisive action and clear hierarchy. They approach leadership as a responsibility that requires tough choices and unwavering resolve. While some might view their methods as harsh, Xanthe is ultimately driven by a desire to maintain order and ensure the kingdom's prosperity."
        },
        cailynn: {
            name: "Cailynn",
            image: "assets/images/tools/chibi_cailynn.png",
            traits: [
                "Spiritual & Insightful",
                "Connected to mystical forces",
                "Values courage and determination",
                "Balances authority with openness"
            ],
            description: "Cailynn possesses a unique spiritual insight that guides their leadership. They value the ancient wisdom of their lineage while remaining open to new ideas. Cailynn understands that true authority comes not just from titles but from the strength of one's spirit and the courage to stand for what's right."
        },
        marik: {
            name: "Marik",
            image: "assets/images/tools/chibi_marik.png",
            traits: [
                "Practical & Observant",
                "Values honesty and integrity",
                "Cautious but fair",
                "Learns from experience"
            ],
            description: "Marik is a keen observer who values practical solutions and honest communication. They believe in learning from mistakes and approaching situations with careful consideration rather than rash action. Though naturally cautious, Marik's fairness and integrity make them a respected figure whose judgment many trust."
        },
        via: {
            name: "Via",
            image: "assets/images/tools/chibi_via.png",
            traits: [
                "Enthusiastic & Optimistic",
                "Values friendship and loyalty",
                "Approaches challenges with energy",
                "Seeks knowledge and growth"
            ],
            description: "Via brings youthful enthusiasm and optimism to their role. They value genuine connections and believe that leadership should be approachable and relatable. Though sometimes naive, Via's sincerity and willingness to learn make them endearing to many who appreciate their fresh perspective and authentic approach to challenges."
        }
    };
    
    // Quiz questions and answers
    const quizQuestions = [
        {
            question: "A foreign emissary arrives unannounced at your court, demanding audience. How do you handle this unexpected visit?",
            answers: [
                { text: "I would welcome them warmly, hear them out, and ensure no voices go unheard.", character: "talon" },
                { text: "I try to de-escalate the situation and then listen to the emissaries' requests.", character: "edwinn" },
                { text: "The Ederian court takes no demands. The emissary will be heard, but cautiously so.", character: "xanthe" },
                { text: "Acknowledge their audacity, but assert your authority as the decision-maker. Remind them that their first impression is already underway while ensuring they feel heard.", character: "cailynn" },
                { text: "Welcome them in, but search them for any concealed weapons or traps. One can't be too careful.", character: "marik" },
                { text: "Hear out a brief explanation for the unexpected and hasty arrival. Depending on the severity of the situation they will either be met immediately or wait the appropriate time.", character: "via" }
            ]
        },
        {
            question: "You overhear rumors of a plot brewing within your own family. What is your initial reaction?",
            answers: [
                { text: "I seek the truth carefully, knowing trust must be earned, even among kin.", character: "talon" },
                { text: "I gather everyone into the same room and bring up the rumors in order to prevent any ill intent.", character: "edwinn" },
                { text: "It is something to be expected, but disputes must be dealt with quickly, quietly, and decisively.", character: "xanthe" },
                { text: "Address the issue head-on—fires spread quickly when left unchecked.", character: "cailynn" },
                { text: "Stay back and watch as they fight and tire each other out, intervene when necessary.", character: "marik" },
                { text: "They're family. I'm sure whatever issue there is we can sort through it together.", character: "via" }
            ]
        },
        {
            question: "A distant kingdom requests your help during a severe famine. How do you decide to assist?",
            answers: [
                { text: "I send aid quickly, recalling that compassion for others strengthens our own realm.", character: "talon" },
                { text: "I send aid quickly while also offering my services to heal.", character: "edwinn" },
                { text: "If our kingdom enjoys surplus, aid could be leveraged for our benefit.", character: "xanthe" },
                { text: "Send aid quickly and offer further refuge if needed.", character: "cailynn" },
                { text: "Send the aid, on the promise that should our kingdom ever need aid, the kindness will be returned.", character: "marik" },
                { text: "Send aid quickly but be sure to manage rations. The entire country will take a hit ensuring as few go hungry as possible.", character: "via" }
            ]
        },
        {
            question: "You have the chance to secretly visit the city incognito. What do you most hope to learn from everyday folk?",
            answers: [
                { text: "I want to hear their songs and stories, to understand their joys and struggles firsthand.", character: "talon" },
                { text: "I want to know their struggles and learn how I can make a difference.", character: "edwinn" },
                { text: "Most people mind their tongue around nobility, this would be a chance to root out dissent or discontent.", character: "xanthe" },
                { text: "It is crucial to understand the values and way of life of the common folk; we should hope to learn all we can.", character: "cailynn" },
                { text: "I need to know how the common people see me. It's easier to bow when faced with royalty, but what is whispered in secret?", character: "marik" },
                { text: "Oh I would love to see what school is like for the regular people! I bet it's so much more relaxing since they don't have to worry about managing kingdoms and all that.", character: "via" }
            ]
        },
        {
            question: "A noble lord you distrust proposes a marriage alliance. How do you respond?",
            answers: [
                { text: "I weigh the impact on my people first, but I keep the door open to peaceful negotiation.", character: "talon" },
                { text: "I politely decline, although a gracious offer I would not be able to accept.", character: "edwinn" },
                { text: "If it is advantageous to the kingdom, refusal would be irresponsible.", character: "xanthe" },
                { text: "Stifle laughter and politely refuse.", character: "cailynn" },
                { text: "An alliance formed out of any dissent will yield awful results, especially for the one getting married.", character: "marik" },
                { text: "Omg NO WAY! I can feel my face turning red just thinking about it.", character: "via" }
            ]
        },
        {
            question: "A family heirloom is stolen from the palace vaults. What is your first course of action?",
            answers: [
                { text: "I quietly organize an investigation, balancing swift justice with the need for discretion.", character: "talon" },
                { text: "I'll interrogate the guards and others in the area. If I must, I will cast zone of truth.", character: "edwinn" },
                { text: "The palace should be put in lockdown, suspects located and questioned.", character: "xanthe" },
                { text: "Connect with the powers beyond this world to help snuff out the thief.", character: "cailynn" },
                { text: "Find the path used to enter or exit the vault, track the intruders down and prove their guilt.", character: "marik" },
                { text: "I'd cast a spell to locate the object.", character: "via" }
            ]
        },
        {
            question: "An old friend from your adventuring days arrives, seeking refuge at court. What is your reaction?",
            answers: [
                { text: "I offer safe haven without hesitation, remembering the bonds forged on the road.", character: "talon" },
                { text: "I accommodate them immediately without question. I then make sure to gain information about their refuge to help in any way I can.", character: "edwinn" },
                { text: "I question their need for refuge, ensuring it won't bring danger to our doorstep.", character: "xanthe" },
                { text: "Quickly welcome them refuge and offer any additional aid.", character: "cailynn" },
                { text: "They will be welcomed in, have fresh food prepared and a roaring fire to greet them of course!", character: "marik" },
                { text: "I'd give them a warm bed, clean clothes, and a full belly! If it's a bestie we would have a sleepover.", character: "via" }
            ]
        },
        {
            question: "One of your trusted advisors disagrees with you publicly during a council meeting. How do you handle it?",
            answers: [
                { text: "I give them room to speak, then reconcile our differences openly in front of everyone.", character: "talon" },
                { text: "Disagreement is part of the game; as long as their disagreement does not seem malicious.", character: "edwinn" },
                { text: "Quickly dismiss concerns in public, their grievances best expressed in private.", character: "xanthe" },
                { text: "Allow them to speak their mind. Disagreements can sometimes bring about better solutions.", character: "cailynn" },
                { text: "Hear them out, but warn them of how they approach concerns in the future. There are ways disagreements can be made known without causing conflict.", character: "marik" },
                { text: "That's ok. We're always learning. I wouldn't appreciate if they were rude but if they're already a trusted advisor then I need to hear them out.", character: "via" }
            ]
        },
        {
            question: "A rival house invites you to a grand feast celebrating their latest victory. Do you attend, and why?",
            answers: [
                { text: "I go in the spirit of understanding, for shared tables can soothe old rivalries.", character: "talon" },
                { text: "If I have better things to do, I do not attend but I send my greatest regards.", character: "edwinn" },
                { text: "I would attend, taking the time to better evaluate their capabilities and position myself accordingly.", character: "xanthe" },
                { text: "Keeping my guard up and my smile sharp, I would attend to gather as much information as possible.", character: "cailynn" },
                { text: "Attend, rivalries lead to stronger houses. Seeing their victory will only motivate me to have my own.", character: "marik" },
                { text: "It could help ease some tensions. They extended the invite so they clearly want to mend our bond.", character: "via" }
            ]
        },
        {
            question: "Tensions rise between two powerful merchant guilds in your realm. How do you mediate the conflict?",
            answers: [
                { text: "I gather them under one roof, helping each side see the other's worth and concerns.", character: "talon" },
                { text: "Bring them together to listen to their concerns, mediate the situation, and work toward a peaceful resolution.", character: "edwinn" },
                { text: "I would pass stronger laws ensuring their efforts are spent efficiently, not on bickering.", character: "xanthe" },
                { text: "Speak to each guild independently to assess the situation before meeting together to come to a solution.", character: "cailynn" },
                { text: "Speak to them individually and try to see which parts of their stories match and who is being dishonest.", character: "marik" },
                { text: "I would try and learn as much information as possible. These things are riddled with complex history and healing takes time as well as a delicate hand.", character: "via" }
            ]
        },
        {
            question: "You discover evidence that might invalidate your rightful claim to the throne. What is your priority?",
            answers: [
                { text: "Preserving unity and fair governance, my personal loss should not plunge the realm into chaos.", character: "talon" },
                { text: "I didn't want the throne, I would rather live my simple life than be chained to the games of politics.", character: "edwinn" },
                { text: "Investigate it carefully, gathering evidence to disprove the ridiculous notion, and double down on other aspects of my claim.", character: "xanthe" },
                { text: "House Falkrest was built upon spirit not necessarily blood ties. Remind the people of the strength of my spirit and the deeds that earned me my title to invalidate any unjust claims.", character: "cailynn" },
                { text: "Work as hard as I can to disprove the invalidation. Despite what people say, they will see that I am the best choice.", character: "marik" },
                { text: "Gosh at this point does that even matter? Whatever dad says goes. It's just petty to dwell on that.", character: "via" }
            ]
        },
        {
            question: "In the midst of a royal banquet, a wandering bard's tale hints at your past failings. How do you react?",
            answers: [
                { text: "I listen openly, for every story, even a harsh one, can teach us something.", character: "talon" },
                { text: "Although embarrassed, I would listen with open ears should those tales be true.", character: "edwinn" },
                { text: "Regain control over the event, and see the bard punished.", character: "xanthe" },
                { text: "Laugh, but ensure the Bard has a few nights of troubled sleep.", character: "cailynn" },
                { text: "Mistakes are to be made, to ignore that is to make everyone question your integrity. Show that you've grown since.", character: "marik" },
                { text: "Laugh it off it's just a joke. (I would die inside and cry about it in bed that night)", character: "via" }
            ]
        },
        {
            question: "You are tasked with choosing a personal guard of elite knights. On what quality do you place the greatest emphasis?",
            answers: [
                { text: "Loyalty and virtue, more than brute strength. A guard should protect body and spirit.", character: "talon" },
                { text: "Kindness and Respect. We must treat the world and the people that live in it with those qualities.", character: "edwinn" },
                { text: "Reputation and subservience, perceived strength can bolster, if not rival absolute strength.", character: "xanthe" },
                { text: "Loyalty and courage. A Knight should be dedicated to those they protect but brave enough to confront any threat be that of sword or heart.", character: "cailynn" },
                { text: "A wide array of skills. It is not enough to just be strong or fast. You don't need to be the best at something, but be good all around and you'll be able to face any challenge.", character: "marik" },
                { text: "Knowledge. I think my biggest mistakes so far are due to my lack of knowledge and understanding. I strive to be better about this.", character: "via" }
            ]
        },
        {
            question: "A powerful ruler from another realm boasts about their riches and might, belittling your kingdom. How do you respond?",
            answers: [
                { text: "I maintain dignity and respect, showing them that true strength lies in a caring, united people.", character: "talon" },
                { text: "Their boasting means nothing to me. I cherish my kingdom, for its wealth lies in far more than mere gold and power.", character: "edwinn" },
                { text: "Such a slight cannot be tolerated, force needed to be either shown, or built to maintain respect.", character: "xanthe" },
                { text: "A Kingdom's might is not measured by riches but instead by the Will of it's people, I will be quick to educate them on that.", character: "cailynn" },
                { text: "Talk is cheap, let them talk. Overreacting to words will do more harm to my kingdom than anything they could say.", character: "marik" },
                { text: "They can say what they want about me but I would make a statement defending my people. We are a good kingdom built on good people. I want them to know that I care for them and defend them even from verbal slights.", character: "via" }
            ]
        },
        {
            question: "You are offered an opportunity to expand your borders by force, but at the cost of many lives. Do you seize it?",
            answers: [
                { text: "I refuse. No conquest is worth sacrificing innocent blood or the heart of my realm.", character: "talon" },
                { text: "Absolutely not. Lives are worth more than the borders of a kingdom.", character: "edwinn" },
                { text: "If the expansion leads to more beneficial resources or positioning, it is worth the short-term pain.", character: "xanthe" },
                { text: "No, forcing those out of their own land is not an act I will stand by. The Great Serpent weeps at such vile bloodshed.", character: "cailynn" },
                { text: "We have a hard enough time ruling the land we do have. We certainly don't need more of it, especially if blood is the cost.", character: "marik" },
                { text: "If it's purely from the benefit of gaining more land I would never agree. I want to make choices for the benefit of the kingdom, not my ego.", character: "via" }
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
        console.log("Initializing quiz with", quizQuestions.length, "questions");
        
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
                answerDiv.dataset.character = answer.character;
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
                    userAnswers[index] = answer.character;
                    console.log(`User selected answer for question ${index + 1}: ${answer.character}`);
                    
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
        
        // Always set up the next button to either go to next question or show results
        nextQuestionBtn.addEventListener('click', function() {
            console.log("Next/Results button clicked");
            if (currentQuestion < quizQuestions.length - 1) {
                goToNextQuestion();
            } else {
                console.log("On last question - showing results");
                showResults();
            }
        });
        
        retakeQuizBtn.addEventListener('click', retakeQuiz);
        downloadResultBtn.addEventListener('click', downloadResult);
        
        // Share buttons
        shareButtons.forEach(button => {
            button.addEventListener('click', shareResult);
        });
        
        // Replace Twitter with Instagram in the share buttons
        const twitterButton = document.querySelector('.btn-share.twitter');
        if (twitterButton) {
            twitterButton.classList.remove('twitter');
            twitterButton.classList.add('instagram');
            twitterButton.setAttribute('data-platform', 'instagram');
            const icon = twitterButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-twitter');
                icon.classList.add('fa-instagram');
            }
        }
    }
    
    // Start the quiz
    function startQuiz() {
        quizIntro.style.display = 'none';
        quizQuestionsSection.style.display = 'block';
        
        // Initialize userAnswers array with empty values
        userAnswers = Array(quizQuestions.length).fill(null);
        
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
    
    // Go to the next question or show results
    function goToNextQuestion() {
        console.log(`Next button clicked, current question: ${currentQuestion + 1} of ${quizQuestions.length}`);
        
        // For debugging
        console.log(`Current question index: ${currentQuestion}, Last question index: ${quizQuestions.length - 1}`);
        console.log(`Is this the last question? ${currentQuestion === quizQuestions.length - 1}`);
        
        // If this is the last question, show results
        if (currentQuestion === quizQuestions.length - 1) {
            console.log("This is the last question, showing results now");
            showResults();
            return;
        }
        
        // Otherwise, go to the next question
        currentQuestion++;
        updateQuestionDisplay();
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
                if (option.dataset.character === userAnswers[currentQuestion]) {
                    option.classList.add('selected');
                }
            });
            
            nextQuestionBtn.disabled = false;
        } else {
            nextQuestionBtn.disabled = true;
        }
        
        // Change text of next button on the last question
        if (currentQuestion === quizQuestions.length - 1) {
            nextQuestionBtn.innerHTML = '<span class="btn-text"><i class="fas fa-crown"></i> See Results</span>';
            console.log("On last question, showing 'See Results' button");
        } else {
            nextQuestionBtn.innerHTML = '<span class="btn-text">Next <i class="fas fa-arrow-right"></i></span>';
        }
    }
    
    // Calculate the results
    function calculateResults() {
        console.log("Calculating results based on user answers:", userAnswers);
        
        // Count the occurrences of each character
        const results = {
            talon: 0,
            edwinn: 0,
            xanthe: 0,
            cailynn: 0,
            marik: 0,
            via: 0
        };
        
        userAnswers.forEach(character => {
            if (character) {
                results[character]++;
            }
        });
        
        console.log("Raw character counts:", results);
        
        // Convert to percentages
        const percentages = {};
        const totalAnswered = userAnswers.filter(Boolean).length;
        
        for (const [character, count] of Object.entries(results)) {
            percentages[character] = Math.round((count / totalAnswered) * 100);
        }
        
        // Get the character with highest percentage
        let topCharacter = null;
        let topPercentage = 0;
        
        for (const [character, percentage] of Object.entries(percentages)) {
            if (percentage > topPercentage) {
                topCharacter = character;
                topPercentage = percentage;
            }
        }
        
        return {
            topCharacter,
            topPercentage,
            percentages
        };
    }
    
    // Show the results
    function showResults() {
        console.log("showResults function called");
        const results = calculateResults();
        console.log("Calculated results:", results);
        
        // Hide questions, show results
        quizQuestionsSection.style.display = 'none';
        quizResults.style.display = 'block';
        
        // Update main result
        const character = characters[results.topCharacter];
        console.log("Top character:", character.name);
        characterName.textContent = character.name;
        characterImage.src = character.image;
        characterImage.alt = character.name;
        primaryPercentage.textContent = `${results.topPercentage}%`;
        
        // Clear traits list and add new traits
        characterTraits.innerHTML = '';
        character.traits.forEach(trait => {
            const li = document.createElement('li');
            li.textContent = trait;
            characterTraits.appendChild(li);
        });
        
        // Set description
        characterDescription.textContent = character.description;
        
        // Create radar chart - wrapped in setTimeout to ensure the container is visible
        setTimeout(() => {
            createRadarChart(results.percentages);
        }, 100);
        
        // Scroll to top of results
        quizResults.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Create the radar chart
    function createRadarChart(percentages) {
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
        
        // Prepare chart data
        const chartData = {
            labels: ['Talon', 'Edwinn', 'Xanthe', 'Cailynn', 'Marik', 'Via'],
            datasets: [
                {
                    label: 'Character Match',
                    data: [
                        percentages.talon,
                        percentages.edwinn,
                        percentages.xanthe,
                        percentages.cailynn,
                        percentages.marik,
                        percentages.via
                    ],
                    backgroundColor: 'rgba(127, 14, 189, 0.2)',
                    borderColor: 'rgba(127, 14, 189, 1)',
                    pointBackgroundColor: 'rgba(127, 14, 189, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(127, 14, 189, 1)'
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
                            }
                        },
                        pointLabels: {
                            font: {
                                size: 14,
                                family: "'Cinzel', serif",
                                weight: 'bold'
                            },
                            color: '#333'
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
                                return context.raw + '% match with ' + context.label;
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
        
        // Reset UI
        document.querySelectorAll('.answer-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Reset progress
        progressFill.style.width = '0%';
        currentQuestionSpan.textContent = '1';
        
        // Show questions, hide results
        quizResults.style.display = 'none';
        quizQuestionsSection.style.display = 'block';
        
        // Show first question
        updateQuestionDisplay();
        
        // Scroll to top of questions
        quizQuestionsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Download the result card
    function downloadResult() {
        const canvas = document.getElementById('result-card-canvas');
        const ctx = canvas.getContext('2d');
        
        // Get the current results
        const results = calculateResults();
        const character = characters[results.topCharacter];
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw purple header background
        ctx.fillStyle = '#7F0EBD';
        ctx.fillRect(0, 0, canvas.width, 100);
        
        // Draw header text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Cinzel';
        ctx.textAlign = 'center';
        ctx.fillText('YOUR CRIMSON COURT CHARACTER MATCH', canvas.width / 2, 60);
        
        // Draw the rest of the background
        ctx.fillStyle = '#F5F0FF';  // Light purple background
        ctx.fillRect(0, 100, canvas.width, canvas.height - 100);
        
        // Load character image
        const characterImg = new Image();
        characterImg.crossOrigin = "Anonymous";
        
        characterImg.onload = function() {
            // Draw character image
            const imgSize = 250;
            ctx.drawImage(characterImg, 100, 160, imgSize, imgSize);
            
            // Draw character name
            ctx.fillStyle = '#7F0EBD';
            ctx.font = 'bold 60px Cinzel';
            ctx.textAlign = 'left';
            ctx.fillText(character.name, 400, 200);
            
            // Draw match percentage
            ctx.font = 'bold 36px Cinzel';
            ctx.fillText(`${results.topPercentage}% Match`, 400, 250);
            
            // Draw traits
            ctx.fillStyle = '#333';
            ctx.font = '20px EB Garamond';
            
            character.traits.forEach((trait, index) => {
                ctx.fillText(`• ${trait}`, 400, 310 + (index * 30));
            });
            
            // Draw description with text wrapping
            const maxWidth = 650; // Reduced from 750 to leave more space for chart
            const words = character.description.split(' ');
            let line = '';
            let y = 440;
            
            ctx.font = '20px EB Garamond';
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                
                if (testWidth > maxWidth && i > 0) {
                    ctx.fillText(line, 400, y);
                    line = words[i] + ' ';
                    y += 30;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 400, y);
            
            // Draw radar chart - position it higher on the card
            const radarChartImage = document.getElementById('results-chart');
            
            // We need to wait for the radar chart to be rendered
            setTimeout(() => {
                // Draw the radar chart - moved higher to avoid text overlap
                ctx.drawImage(radarChartImage, 800, 140, 300, 300);
                
                // Draw website link at bottom
                ctx.fillStyle = '#333';
                ctx.font = 'italic 18px EB Garamond';
                ctx.textAlign = 'center';
                ctx.fillText('Find out which heir you are at rollwithadvantage.com', canvas.width / 2, canvas.height - 30);
                
                // Draw dividing line between header and content
                ctx.beginPath();
                ctx.moveTo(0, 100);
                ctx.lineTo(canvas.width, 100);
                ctx.strokeStyle = '#7F0EBD';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Create download link
                const dataURL = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `Crimson-Court-${character.name}-Match.png`;
                link.click();
            }, 300); // Delay to ensure chart is rendered
        };
        
        characterImg.src = character.image;
        characterImg.onerror = function() {
            console.error("Failed to load character image");
            // Fallback if image fails to load
            ctx.fillStyle = '#DDD';
            ctx.fillRect(100, 160, 250, 250);
            ctx.fillStyle = '#7F0EBD';
            ctx.font = 'bold 40px Cinzel';
            ctx.fillText(character.name[0], 225, 285);
            
            // Continue with the rest of the rendering
            // Draw character name, traits, etc.
        };
    }
    
    // Share the result
    function shareResult(event) {
        const platform = event.currentTarget.dataset.platform;
        const results = calculateResults();
        const character = characters[results.topCharacter];
        
        const text = `I'm a ${results.topPercentage}% match with ${character.name} from The Crimson Court! Take the quiz to discover your royal match:`;
        const url = 'https://rollwithadvantage.com/character-quiz.html';
        
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