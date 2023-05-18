class MatchGrid {
  constructor(gridConfig) {
    this.width = gridConfig.width;
    this.height = gridConfig.height;
    this.theme = gridConfig.theme;
    this.columns = gridConfig.columns;
    this.timeLimit = gridConfig.timeLimit;
    this.flippedCards = [];
    this.matches = 0;
    this.moves = 0;
    this.timerId = null;
    this.timerIsPaused = false;
    this.boardWrapper = document.getElementById(gridConfig.anchorId);
    this.cards = this.createCardArray(gridConfig.rows, gridConfig.columns);
    this.init();
  }
  createCardArray(rows, columns) {
    let result = [];

    for (let i = 1; i <= (rows * columns) / 2; i++) {
      result.push(i);
    }

    return result.concat(result);
  }

  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  createBoard() {
    this.cards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "card";
      cardElement.innerHTML = `<p>${card}</p>`;
      cardElement.dataset.value = card;
      cardElement.style.minWidth =
      this.width.replace("px", "") / this.columns - 2 + "px";
      cardElement.style.backgroundColor = this.theme.cardBGColor;
      cardElement.style.color = this.theme.cardTextColor;
      cardElement.style.fontSize = this.theme.cardFontSize;
      cardElement.addEventListener("click", () => this.flipCard(cardElement));
      this.boardWrapper.appendChild(cardElement);
    });
  }

  transformTime(time) {
    let minutes;
    let seconds;

    minutes = Math.floor(time / 60);
    seconds = time % 60;

    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    return minutes + ":" + seconds;
  }

  startTimer() {
    const timerElement = document.createElement("div");
    let timeLeft = this.timeLimit;
    timerElement.id = "timer_wrapper";
    timerElement.innerText = this.transformTime(this.timeLimit);
    timerElement.style.backgroundColor = this.theme.wrapperBGColor;
    this.boardWrapper.appendChild(timerElement);

    this.timerId = setInterval(() => {
      if (!this.timerIsPaused) {
        timeLeft--;
        timerElement.innerText = this.transformTime(timeLeft);

        if (timeLeft <= 0) {
          this.finishGame(false);
        }
      }
    }, 1000);
  }

  changePauseStatus(status) {
    if (status) {
      this.timerIsPaused = true;
    } else {
      this.timerIsPaused = false;
    }
  }

  finishGame(status) {
    const timerEl = document.getElementById("timer_wrapper");
    this.boardWrapper.removeChild(timerEl);
    clearInterval(this.timerId);
    this.timerId = null;

    const statusElement = document.createElement("div");
    statusElement.className = "status_window";
    
    if (status) {
      statusElement.innerHTML = `<p class="status_message">Congratulations! You won in ${this.moves} moves.</p><button id="reset_button">Play Again</button>`;
    } else {
      statusElement.innerHTML = `<p class="status_message">The time has run out!</p><button id="reset_button">Play Again</button>`;
    }
    this.boardWrapper.appendChild(statusElement);
    document
      .getElementById("reset_button")
      .addEventListener("click", () => this.resetGrid());
  }

  flipCard(cardElement) {
    console.log(this.flippedCards.length === 2);
    if (
      cardElement.classList.contains("matched") ||
      cardElement.classList.contains("flipped") ||
      this.flippedCards.length === 2
    ) {
      return;
    }

    cardElement.classList.add("flipped");
    this.flippedCards.push(cardElement);

    anime({
      targets: cardElement,
      rotateY: -180,
      direction: "reverse",
      duration: 500,
      easing: "easeInOutSine",
    });

    if (this.flippedCards.length === 2) {
      const [card1, card2] = this.flippedCards;
      const value1 = card1.dataset.value;
      const value2 = card2.dataset.value;

      if (value1 === value2) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
        this.flippedCards = [];
        this.matches++;

        if (this.matches === this.cards.length / 2) {
          console.log("all matched");
          setTimeout(() => {
            this.finishGame(true);
          }, 500);
        }
      } else {
        setTimeout(() => {
          anime({
            targets: ".card.flipped:not(.matched)",
            rotateY: 180,
            direction: "reverse",
            duration: 500,
            easing: "easeInOutSine",
          });
          this.flippedCards = [];
          card1.classList.remove("flipped");
          card2.classList.remove("flipped");
        }, 1000);
      }
      this.moves++;
    }
  }

  init() {
    this.boardWrapper.style.width = this.width;
    this.boardWrapper.style.height = this.height;
    this.boardWrapper.style.fontFamily = this.theme.font;
    this.boardWrapper.style.backgroundColor = this.theme.wrapperBGColor;
    this.boardWrapper.innerHTML = `<button id="start_btn">Start!</button>`;

    this.boardWrapper.addEventListener("mouseleave", () =>
      this.changePauseStatus(true)
    );
    this.boardWrapper.addEventListener("mouseenter", () =>
      this.changePauseStatus(false)
    );

    const startBtn = document.getElementById("start_btn");

    startBtn.addEventListener("click", () => this.start());
  }

  start() {
    this.boardWrapper.innerHTML = null;
    this.shuffleCards();
    this.createBoard();
    this.startTimer();
  }

  resetGrid() {
    let cardElements = document.getElementsByClassName("card");

    for (let card of cardElements) {
      this.boardWrapper.removeChild(card);
    }

    this.flippedCards = [];
    this.matches = 0;
   
    this.start();
  }
}

let gridConfig = {
  anchorId: 'board-wrapper',
  width: "400px",
  height: "400px",
  rows: 3,
  columns: 3,
  timeLimit: 66,
  theme: { font: "Aerial", cardBGColor: "red", cardTextColor: "blue", cardFontSize: '30px', wrapperBGColor: 'grey' },
};

let grid = new MatchGrid(gridConfig);
