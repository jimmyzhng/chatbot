type RPSChoice = 'rock' | 'paper' | 'scissors';
type RPSResult = 'win' | 'lose' | 'draw';

export interface RPSOutcome {
    userChoice: RPSChoice;
    botChoice: RPSChoice;
    result: RPSResult
}

export const playRPS = (userChoice: RPSChoice): RPSOutcome => {

    // get bot choice
    let choices: RPSChoice[] = ['rock', 'paper', 'scissors']
    let botChoice = choices[Math.floor(Math.random() * choices.length)]

    // get result
    let result: RPSResult

    if (userChoice === botChoice) {
        result = 'draw'
    } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
    ) {
        result = 'win'
    } else {
        result = 'lose'
    }

    return {userChoice, botChoice, result}
}



