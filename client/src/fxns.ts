import { Card, Hand, Player } from './interfaces'

// Interface Implementations
export class hand implements Hand {
    cards: Card[] = []
    bet: number = 0
    status: string = ''

    constructor(card: Card, bet: number) {
        this.cards.push(card)
        this.bet = bet
    }

    private evaluateA(): number {
        let values = 0, aIndex: number[] = []

        this.cards.forEach((card, idx) => {
            if (card.faceVal === 'A')
                aIndex.push(idx)
        })

        for (let i = 0; i < this.cards.length; i++) {
            if (!aIndex.includes(i))
                values += this.cards[i].val[0]
        }

        for (let i = 0; i < this.cards.length; i++) {
            if (aIndex.includes(i)) {
                values += this.cards[i].val[0]

                if ((values + 10) <= 21)
                    values += this.cards[i].val[1] - this.cards[i].val[0]
            }
        }
        return values
    }

    val(): number {
        let values = 0, hasA = false

        this.cards.forEach(card => {
            if (card.faceVal === 'A')
                hasA = true
        })

        if (hasA === false) {
            this.cards.forEach(card => {
                values += card.val[0]
            })
        } else
            values += this.evaluateA()

        return values
    }
}

export class player implements Player {
    hands: Hand[] = []
    balance: number = 0
    insurance: number = 0

    constructor(bal: number) {
        this.balance = bal
    }
}

let stack: Card[] = [], // Card stack of 52
    //  values -> 1|11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10
    card_faces = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
    card_types = ['Spades', 'Diamonds', 'Hearts', 'Clubs']

card_types.forEach(t => { //Initialize deck
    card_faces.forEach(c => {
        let faceVal = c, type = t, val = [Number(c)];

        if (['J', 'Q', 'K'].includes(c))
            val = [10]
        if (c === 'A')
            val = [1, 11]

        stack.push({
            faceVal: faceVal,
            type: type,
            val: val
        })
    });
});

export let // Gameplay Functions

    usedCards: Card[] = [], // cards already dealt -- inorder to not deal same card twice

    createDealer = (dealer: Player): Player => {
        usedCards = []
        dealer.hands = []
        dealer.hands.push(new hand(drawCard(), 0))
        dealer.hands[0].cards.push(drawCard())
        return dealer
    },

    createPlayer = (player1: Player, bet: number): Player => {
        player1.hands = []
        player1.balance -= bet
        player1.hands.push(new hand(drawCard(), bet))
        player1.hands[0].cards.push(drawCard())
        return player1
    },

    drawCard = (): Card => {
        let card = stack[Math.floor(Math.random() * 52)]

        if (usedCards.includes(card))
            return drawCard()
        usedCards = [...usedCards, card] // Pushing a copy of each card drawn into here
        return card
    },

    splitHand = (hnd: Hand, player: Player): void => {
        player.hands.push(new hand(hnd.cards[0], hnd.bet))

        if (hnd.cards[0].faceVal === 'A') //Will use this later to make sure you split aces can't be hit anymore
            hnd.status = player.hands[player.hands.length - 1].status = 'SPLIT ACES'

        hnd.cards.shift()
        player.balance -= hnd.bet

        hit(hnd)
        hit(player.hands[player.hands.length - 1])
    },

    hit = (hnd: Hand): void => {
        hnd.cards.push(drawCard())
    },

    double = (hnd: Hand, player: Player): void => {
        player.balance -= hnd.bet
        hnd.bet = Math.floor(hnd.bet *= 2)
        hnd.status = 'DOUBLED' // disable hit button
        hit(hnd)
    },

    surrender = (hnd: Hand, player: Player, dealer: Player): void => {
        player.balance += Math.floor(hnd.bet / 2)
        hnd.bet = 0
        hnd.status = 'SURRENDERED'
    },

    insure = (hnd: Hand, player: Player): void => {
        player.insurance += Math.floor(hnd.bet / 2)
        player.balance -= player.insurance
    },

    blackjack = (player: Player): boolean => {
        let hasA = false, has10 = false

        if (player.hands.length === 1 && player.hands[0].cards.length === 2) { //Blackjack only occurs on first hand with initial two cards
            player.hands[0].cards.forEach(card => {
                if (card.faceVal === 'A')
                    hasA = true
            })

            player.hands[0].cards.forEach(card => {
                if (['10', 'J', 'Q', 'K'].includes(card.faceVal))
                    has10 = true
            })
        }

        if (hasA && has10)
            return true
        else
            return false
    },

    settle = (hand: Hand, player: Player, dealer: Player) => {

        let dVal = dealer.hands[0].val(), pVal = hand.val(),
            bust = () => { // Player busts
                if (hand.bet > 0)
                    if (hand.status !== 'SURRENDERED') hand.status += `${hand.status !== '' ? ', ' : ''} LOST (-$${hand.bet}) `
                hand.bet = 0
            },
            winx2 = () => { // Player WINS x2
                if (hand.status !== 'SURRENDERED') hand.status += `${hand.status !== '' ? ', ' : ''} WON (+$${hand.bet}) `
                player.balance += Math.floor(hand.bet *= 2)
                hand.bet = 0
            },
            insurex2 = () => { //Insurance winning 2:1
                hand.status += `${hand.status !== '' ? ', ' : ''} INS (+$${Math.floor(player.insurance * 2)}) `
                player.balance += (player.insurance += Math.floor(player.insurance * 2))
                player.insurance = 0
            },
            insurebust = () => { //Loses insurance
                hand.status += `${hand.status !== '' ? ', ' : ''} INS (-$${player.insurance})`
                player.insurance = 0
            },
            tie = () => {
                player.balance += hand.bet
                hand.bet = 0
                if (hand.status !== 'SURRENDERED') hand.status += `${hand.status !== '' ? ', ' : ''} TIE `; dealer.hands[0].status += 'TIE'
            }

        if (blackjack(player) && !blackjack(dealer)) {
            if (player.insurance > 0) insurebust()

            // Player WINS 3:2
            if (hand.status !== 'SURRENDERED') hand.status += `${hand.status !== '' ? ',' : ''} WON (+$${hand.bet * 1.5})`
            player.balance += (hand.bet += (Math.floor(hand.bet * 1.5)))
            hand.bet = 0

        } else if (!blackjack(player) && blackjack(dealer)) {
            if (player.insurance > 0) insurex2()
            dealer.hands[0].status = 'BLACKJACK'
            bust()

        } else if (blackjack(player) && blackjack(dealer)) {
            if (player.insurance > 0) insurex2()
            tie()
            dealer.hands[0].status = 'BLACKJACK , TIE'

        } else {
            if (player.insurance > 0) insurebust()
            if (pVal <= 21)
                if (dVal <= 21) {
                    if (pVal === dVal) tie()
                    else if (pVal > dVal) winx2()
                    else bust()
                } else winx2()
            else bust()
        }
    },
    
    totalBet = (player: Player): number => {
        let betSum = 0
        player.hands.forEach(hand => betSum += hand.bet)
        return betSum
    },

    totalCards = (player: Player): number => {
        let cardSum = 0
        player.hands.forEach(hand => {
            if (hand.val() !== 0)
                cardSum += hand.cards.length
        })
        return cardSum
    }

export { stack }