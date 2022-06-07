import { DetailedHTMLProps, ButtonHTMLAttributes, useState, useReducer, useEffect } from 'react';
import {
    blackjack, createDealer, createPlayer, double, drawCard, hit,
    insure, settle, splitHand, stack, surrender, totalBet, totalCards
} from '../fxns';
import { Hand, Player, PlayerActions } from '../interfaces';
import { defaultBalance, updateUserData, useMainContext } from '../app';
import logger from '../config/logging';
import './main.css';

//WARNING: THIS IS A LOGICAL MINEFIELD! I HAVE ABSOLUTELY NO IDEA WHAT I DID HERE (MOSTLY)
//This was all earlier in the project, when i knew a lot less than rn. Too tired to refactor.

export const Main = () => {

    const
        { activeIconTheme, bet, user, balance, restart, setActiveModal, setBet, setBalance, toggleRestart } = useMainContext(),
        actionButtons: { [key: string]: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> } = {
            'hitButton': <button key={'hit'} className="ctrl hit" onClick={() => setPlayer({ type: 'HIT' })}>Hit</button>,
            'doubleButton': <button key={'split'} className="ctrl double" onClick={() => setPlayer({ type: 'DOUBLE' })}>Double</button>,
            'splitButton': <button key={'double'} className="ctrl split" onClick={() => setPlayer({ type: 'SPLIT' })}>Split</button>,
            'insureButton': <button key={'insure'} className="ctrl insure" onClick={() => setPlayer({ type: 'INSURE' })}>Insure</button>,
            'surrenderButton': <button key={'surrender'} className="ctrl surrender" onClick={() => setPlayer({ type: 'SURRENDER' })}>Surrender</button>
        },
        initialPlayer: Player = {
            hands: [
                {
                    cards: [],
                    bet: 0,
                    status: '',
                    val: () => 0
                }
            ],
            insurance: 0,
            balance: balance
        },
        initialDealer: Player = { ...initialPlayer, balance: 0 },

        //Functions
        reducePlayer = (state: Player, action: PlayerActions): Player => {
            let newState = { ...state }

            switch (action.type) {
                case 'HIT':
                    if (id <= newState.hands.length)
                        hit(newState.hands[id])
                    setActiveActionButtons({ 'hitButton': actionButtons['hitButton'] })
                    return newState

                case 'DOUBLE':
                    if (id <= newState.hands.length && newState.balance - newState.hands[id].bet >= 0)
                        double(newState.hands[id], newState)
                    setActiveActionButtons({})
                    return newState

                case 'SPLIT':
                    if (
                        newState.hands.length <= 3
                        && id <= newState.hands.length
                        && newState.hands[id].val() > 0
                        && newState.balance - newState.hands[id].bet >= 0
                        && JSON.stringify(newState.hands[id].cards[0].val) === JSON.stringify(newState.hands[id].cards[1].val)
                    ) {
                        splitHand(newState.hands[id], newState)
                        setActiveActionButtons({})
                    }
                    return newState

                case 'INSURE':
                    if (id <= newState.hands.length && newState.balance - newState.hands[id].bet >= 0)
                        insure(newState.hands[id], newState)
                    delete activeActionButtons['splitButton']
                    delete activeActionButtons['insureButton']
                    delete activeActionButtons['surrenderButton']
                    return newState

                case 'SURRENDER':
                    if (id <= newState.hands.length)
                        surrender(newState.hands[id], newState, dealer)
                    setActiveActionButtons({})
                    return newState

                case 'STAND':
                    if (newState.hands.length > id + 1)
                        setId(id + 1)
                    else {
                        setId(newState.hands.length + 1)
                        setActiveActionButtons({})
                        dealerHandOff(dealer)
                    }
                    return state

                case 'PLAY':
                    newState = createPlayer(newState, bet)
                    if (dealer.hands[0].val() === 0)
                        setDealer(createDealer(dealer))
                    return newState

                case 'SETTLE':
                    if (settler) {
                        newState.hands.forEach(hand => {
                            settle(hand, newState, dealer)
                        })
                        if (user.name !== ('Guest' || ''))
                            updateUserData(user.uid, newState.balance, (error, user) => { if (error) logger.error(error) })
                        else localStorage.setItem('balance', `${newState.balance}`)
                        setSettler(false)
                    }
                    return newState

                case 'RESET':
                    setDealer(createDealer(dealer))
                    return createPlayer(newState, 0)

                case 'RESTART':
                    setDealer(initialDealer)
                    newState = initialPlayer
                    newState.balance = dealer.balance = defaultBalance
                    return newState

                default:
                    return newState
            }
        },
        showButtons = (hnd: Hand, player: Player, dealer: Player) => {
            if (player.hands.length <= 4 && hnd.val() > 0 && hnd.val() <= 21 && !blackjack(player) && hnd.status !== 'SPLIT') {
                setActiveActionButtons(prevState => { return { ...prevState, 'hitButton': actionButtons['hitButton'] } })

                if (hnd.cards.length === 2) {
                    if (player.balance - hnd.bet >= 0) {
                        if (JSON.stringify(hnd.cards[0].val) === JSON.stringify(hnd.cards[1].val) && player.hands.length <= 3) 
                            setActiveActionButtons(prevState => { return { ...prevState, 'splitButton': actionButtons['splitButton'] } })

                        if (dealer.hands[0].cards[0].faceVal === 'A' && player.insurance === 0)
                            setActiveActionButtons(prevState => { return { ...prevState, 'insureButton': actionButtons['insureButton'] } })
                        if (player.insurance < 1)
                            setActiveActionButtons(prevState => { return { ...prevState, 'doubleButton': actionButtons['doubleButton'] } })
                    }
                    setActiveActionButtons(prevState => { return { ...prevState, 'surrenderButton': actionButtons['surrenderButton'] } })
                }
            }
        },
        dealerHandOff = (dealer: Player) => {
            setPlayBtn('Hold on..')
            setHideCard(false)
            let prevDealer = { ...dealer }
            if (prevDealer.hands[0].val() < 17) {
                setTimeout(() => {
                    hit(prevDealer.hands[0])
                    setDealer(prevDealer)
                    dealerHandOff(dealer)
                }, 600)
            } else setSettler(true)
        },

        [id, setId] = useState(0),
        [playBtn, setPlayBtn] = useState('Play'),
        [hideCard, setHideCard] = useState(true),
        [settler, setSettler] = useState(false),
        [activeActionButtons, setActiveActionButtons] = useState<{
            [key: string]: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
        }>({}),
        [dealer, setDealer] = useState(initialDealer),
        [player, setPlayer] = useReducer(reducePlayer, initialPlayer)

    useEffect(() => {
        if (bet && bet > 0) {
            setHideCard(true)
            setId(0)
            setPlayer({ type: 'RESET' })
            setPlayer({ type: 'PLAY' })
            setPlayBtn('Stand');
        }
        // eslint-disable-next-line
    }, [bet])

    useEffect(() => { if (restart) { setPlayer({ type: 'RESTART' }); setPlayBtn('Play'); toggleRestart!(false) } }, [restart])

    useEffect(() => {
        if (settler)
            setTimeout(() => {
                setPlayer({ type: 'SETTLE' })
                setBet!(0)
                setPlayBtn('Play Again');
            }, 400);
        //eslint-disable-next-line
    }, [settler])

    useEffect(() => {
        if (id < player.hands.length && player.hands[id].bet > 0 && player.hands[id].status !== 'DOUBLED')
            showButtons(player.hands[id], player, dealer)
        // eslint-disable-next-line
    }, [id, playBtn, player])

    useEffect(() => {
        const hand = player.hands[id]
        if (id <= player.hands.length && hand.val() > 21) {
            setActiveActionButtons({})
            dealer.balance += hand.bet
            hand.status = `BUST \n (-$${hand.bet})`
            hand.bet = 0
        } // Hand BUSTS immediately. is disabled. play moves on

        if (id <= player.hands.length && hand.val() <= 21 && blackjack(player)) {
            setTimeout(() => {
                hand.status = 'BLACKJACK'
                if (dealer.hands[0].cards[0].faceVal === 'A' && player.insurance < 1)
                    setActiveActionButtons(prevState => { return { ...prevState, 'insureButton': actionButtons['insureButton'] } })
                else setActiveActionButtons({})
            }, 500);
        }
        // eslint-disable-next-line
    }, [player])

    return (
        <div className="main">
            <div className="board">
                <div className="board-inner">

                    <div className="board-head">
                        <div className="block player" id="player">
                            <svg
                                className="icon user"
                                viewBox="0 0 100 100"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path fillRule="evenodd" clipRule="evenodd" d="M32.2917 31.2498C32.2917 21.4698 40.22 13.5415 50.0001 13.5415C59.7801 13.5415 67.7084 21.4698 67.7084 31.2498C67.7084 41.0299 59.7801 48.9582 50.0001 48.9582C40.22 48.9582 32.2917 41.0299 32.2917 31.2498ZM50.0001 19.7915C43.6717 19.7915 38.5417 24.9216 38.5417 31.2498C38.5417 37.5781 43.6717 42.7082 50.0001 42.7082C56.3284 42.7082 61.4584 37.5781 61.4584 31.2498C61.4584 24.9216 56.3284 19.7915 50.0001 19.7915Z" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M33.3333 61.4585C28.1556 61.4585 23.9583 65.656 23.9583 70.8335V75.7847C23.9583 75.8602 24.0129 75.9243 24.0873 75.9364C41.2488 78.7385 58.7512 78.7385 75.9124 75.9364C75.987 75.9243 76.0416 75.8602 76.0416 75.7847V70.8335C76.0416 65.656 71.8441 61.4585 66.6666 61.4585H65.2462C65.1366 61.4585 65.0274 61.476 64.9228 61.5097L61.3166 62.6877C53.9633 65.0885 46.0366 65.0885 38.6832 62.6877L35.0769 61.5097C34.9725 61.476 34.8633 61.4585 34.7535 61.4585H33.3333ZM17.7083 70.8335C17.7083 62.2039 24.7038 55.2085 33.3333 55.2085H34.7535C35.5223 55.2085 36.2861 55.3302 37.0169 55.5685L40.6232 56.7464C46.7162 58.7356 53.2837 58.7356 59.3766 56.7464L62.9828 55.5685C63.7137 55.3302 64.4774 55.2085 65.2462 55.2085H66.6666C75.2962 55.2085 82.2916 62.2039 82.2916 70.8335V75.7847C82.2916 78.9231 80.017 81.5989 76.9195 82.1047C59.0912 85.0156 40.9087 85.0156 23.0802 82.1047C19.9828 81.5989 17.7083 78.9231 17.7083 75.7847V70.8335Z" />
                            </svg>
                            ${player.balance}
                            <div className="tooltip">You</div>
                        </div>
                        <div className="block deck" id="deck">
                            <svg
                                className="icon box"
                                viewBox="0 0 100 100"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M69.7916 45.8335C69.7916 47.5593 68.3924 48.9585 66.6666 48.9585H33.3333C31.6074 48.9585 30.2083 47.5593 30.2083 45.8335C30.2083 44.1077 31.6074 42.7085 33.3333 42.7085H66.6666C68.3924 42.7085 69.7916 44.1077 69.7916 45.8335Z" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M18.2733 33.9444L23.2264 20.4127C24.4746 17.0025 27.5021 14.5589 31.0989 14.0584C43.6392 12.3132 56.3609 12.3132 68.9017 14.0584C72.4984 14.5589 75.5259 17.0026 76.7743 20.4128L81.7276 33.9456C82.6538 35.391 83.2917 37.0432 83.5597 38.8244L83.9847 41.6487C85.6505 52.7264 85.4947 64.0019 83.5234 75.0289C82.6497 79.9177 78.6347 83.6314 73.6926 84.1219L68.5659 84.6306C56.2188 85.856 43.7809 85.856 31.4341 84.6306L26.3072 84.1219C21.3652 83.6314 17.3504 79.9177 16.4765 75.0289C14.5054 64.0019 14.3496 52.7264 16.0155 41.6487L16.4402 38.8244C16.7081 37.0426 17.3465 35.39 18.2733 33.9444ZM31.9603 20.2487C43.9292 18.5831 56.0713 18.5831 68.0401 20.2487C69.3488 20.4309 70.4505 21.3201 70.9051 22.561L73.0142 28.3235C72.8251 28.2959 72.6347 28.2726 72.4434 28.2536L68.3676 27.8491C56.1526 26.6367 43.8476 26.6367 31.6325 27.8491L27.5567 28.2536C27.3653 28.2726 27.1751 28.2959 26.9863 28.3234L29.0955 22.561C29.5498 21.3201 30.6515 20.4309 31.9603 20.2487ZM23.6903 37.0872L23.7681 37.1156L23.8645 36.8521C24.8885 35.536 26.4265 34.6465 28.174 34.4731L32.2498 34.0685C44.0542 32.8969 55.9455 32.8969 67.7501 34.0685L71.8259 34.4731C73.5738 34.6466 75.1122 35.5364 76.1359 36.8529L76.2322 37.1156L76.3097 37.0873C76.8559 37.8618 77.2309 38.7683 77.3792 39.7537L77.8038 42.5781C79.3684 52.9823 79.2222 63.5723 77.3709 73.9293C76.9893 76.0656 75.2347 77.6881 73.0755 77.9023L67.9484 78.4114C56.0122 79.596 43.988 79.596 32.0514 78.4114L26.9245 77.9023C24.7651 77.6881 23.0108 76.0656 22.629 73.9293C20.7777 63.5723 20.6314 52.9823 22.196 42.5781L22.6207 39.7537C22.7689 38.7682 23.144 37.8618 23.6903 37.0872Z" />
                            </svg>
                            {stack.length - (totalCards(player) + totalCards(dealer))}
                            <div className="tooltip">Deck</div>
                        </div>
                        <div className="block hands" id="hands">
                            <svg
                                className="icon hands"
                                viewBox="0 0 100 100"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M37.5001 13.5415C24.2682 13.5415 13.5417 24.268 13.5417 37.4998V67.1119C13.5417 68.8378 14.9409 70.2369 16.6667 70.2369C18.3926 70.2369 19.7917 68.8378 19.7917 67.1119V37.4998C19.7917 27.7198 27.72 19.7915 37.5001 19.7915H66.7205C68.4463 19.7915 69.8455 18.3924 69.8455 16.6665C69.8455 14.9406 68.4463 13.5415 66.7205 13.5415H37.5001Z" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M76.6774 28.3053C63.1733 26.796 49.3266 26.796 35.8228 28.3053C31.9758 28.7352 28.8844 31.7627 28.4309 35.6395C26.8293 49.3334 26.8293 63.1667 28.4309 76.8604C28.8844 80.7375 31.9758 83.7646 35.8228 84.1946C49.3266 85.7042 63.1733 85.7042 76.6774 84.1946C80.5241 83.7646 83.6158 80.7375 84.0691 76.8604C85.6708 63.1667 85.6708 49.3334 84.0691 35.6395C83.6158 31.7627 80.5241 28.7352 76.6774 28.3053ZM36.517 34.5166C49.5595 33.0589 62.9403 33.0589 75.9828 34.5166C76.972 34.6271 77.7495 35.4092 77.8612 36.3656C79.4066 49.5767 79.4066 62.9234 77.8612 76.1346C77.7495 77.0909 76.972 77.8729 75.9828 77.9834C62.9403 79.4413 49.5595 79.4413 36.517 77.9834C35.528 77.8729 34.7505 77.0909 34.6386 76.1346C33.0935 62.9234 33.0935 49.5767 34.6386 36.3656C34.7505 35.4092 35.528 34.6271 36.517 34.5166Z" />
                            </svg>
                            {player.hands[0].val() > 0 ? player.hands.length : 0}
                            <div className="tooltip">Hands</div>
                        </div>
                        <div className="block bet-count" id="bet-count">
                            <svg
                                className="icon coin"
                                viewBox="0 0 100 100"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M50.0002 8.3335C27.0835 8.3335 8.3335 27.0835 8.3335 50.0002C8.3335 72.9168 27.0835 91.6668 50.0002 91.6668C72.9168 91.6668 91.6668 72.9168 91.6668 50.0002C91.6668 27.0835 72.9168 8.3335 50.0002 8.3335ZM50.0002 83.3335C31.6668 83.3335 16.6668 68.3335 16.6668 50.0002C16.6668 31.6668 31.6668 16.6668 50.0002 16.6668C68.3335 16.6668 83.3335 31.6668 83.3335 50.0002C83.3335 68.3335 68.3335 83.3335 50.0002 83.3335Z" />
                                <path d="M55.4167 45.8335H44.5834C42.5 45.8335 40.8333 44.1668 40.8333 42.0835C40.8333 40.0002 42.5 38.3335 44.5834 38.3335H60C62.5 38.3335 64.1667 36.6668 64.1667 34.1668C64.1667 31.6668 62.5 30.0002 60 30.0002H54.1667V26.2502C54.1667 23.7502 52.5 22.0835 50 22.0835C47.5 22.0835 45.8334 23.7502 45.8334 26.2502V30.0002H44.5834C37.9167 30.0002 32.5 35.4168 32.5 42.0835C32.5 48.7502 37.9167 54.1668 44.5834 54.1668H55C57.0834 54.1668 58.75 55.8335 58.75 57.9168C58.75 60.0002 57.0834 61.6668 55 61.6668H39.5833C37.0833 61.6668 35.4167 63.3335 35.4167 65.8335C35.4167 68.3335 37.0833 70.0002 39.5833 70.0002H45.8334V73.7502C45.8334 76.2502 47.5 77.9168 50 77.9168C52.5 77.9168 54.1667 76.2502 54.1667 73.7502V70.0002H55.4167C62.0834 70.0002 67.5 64.5835 67.5 57.9168C67.5 51.2502 62.0834 45.8335 55.4167 45.8335Z" />
                            </svg>
                            {`$${totalBet(player)}`}
                            <div className="tooltip">Your bet</div>
                        </div>
                    </div>

                    <div className="board-body">
                        <div className="hands dealer">
                            {dealer.hands.map((hand, idx) => (
                                hand.val() > 0 ?
                                    <div key={idx} className={`hand ${player.hands.length + 1 === id ? 'active' : ''} ${hand.status && !hideCard ? 'statued' : ''}`} >
                                        <div className="cards">
                                            {hideCard ? //Hide the dealer's first card until player id done drawing and play is handed over to dealer
                                                <>
                                                    <div key={0} className="card" draggable={true}>
                                                        <div className="face-value">
                                                            <span className="cap">?</span>
                                                        </div>
                                                        <div className="suit-icon">
                                                            <svg
                                                                className="icon panda"
                                                                viewBox="0 0 100 100"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path d="M60.5771 25.5352H39.4454C34.1318 25.5395 29.0372 27.651 25.2788 31.4061C21.5204 35.1622 19.4045 40.2546 19.397 45.5684V64.5021C19.4046 69.8157 21.5204 74.908 25.2788 78.6645C29.0372 82.4199 34.1318 84.5312 39.4454 84.5354H60.5771C65.8906 84.531 70.9852 82.4196 74.7437 78.6645C78.5021 74.9083 80.6179 69.816 80.6255 64.5021V45.5684C80.6178 40.2549 78.502 35.1625 74.7437 31.4061C70.9852 27.6507 65.8906 25.5394 60.5771 25.5352V25.5352ZM77.4858 64.5016C77.4771 68.9816 75.6931 73.2769 72.5238 76.443C69.3533 79.6101 65.0572 81.3907 60.5771 81.3952H39.4454C34.9653 81.3908 30.6689 79.6101 27.4986 76.443C24.3292 73.2769 22.5454 68.9819 22.5367 64.5016V45.5679C22.5454 41.0878 24.3294 36.7925 27.4986 33.6265C30.6692 30.4593 34.9653 28.6788 39.4454 28.6743H60.5771C65.0572 28.6787 69.3536 30.4594 72.5238 33.6265C75.6932 36.7925 77.4771 41.0875 77.4858 45.5679V64.5016Z" stroke="black" />
                                                                <path d="M52.1447 54.579H49.4135C47.4039 54.579 45.3472 54.4224 44.0121 55.7091C43.2773 56.4615 42.8907 57.4854 42.9444 58.5345C42.9356 60.1444 43.4744 61.7081 44.4732 62.9686C45.4719 64.2302 46.8715 65.114 48.4388 65.4743V73.5126C48.4388 74.38 49.1419 75.083 50.0092 75.083C50.8766 75.083 51.5797 74.38 51.5797 73.5126V65.4743C53.1369 65.1162 54.5279 64.2423 55.5254 62.9938C56.523 61.7454 57.0684 60.1957 57.0739 58.5978C57.1713 57.4534 56.7968 56.3189 56.0379 55.4582C54.9165 54.6412 53.5081 54.3236 52.1446 54.5788L52.1447 54.579ZM50.0092 62.4289C47.8452 62.4201 46.0929 60.6679 46.0842 58.5039C46.0656 58.309 46.104 58.113 46.1938 57.9388C46.7753 57.6815 47.4148 57.584 48.0467 57.6563H49.3029H52.2707C52.8829 57.6563 53.6999 57.5775 53.8411 57.6563H53.84C53.9397 57.9378 53.978 58.2378 53.9495 58.5346C53.9495 60.7117 52.1853 62.4761 50.0092 62.4761L50.0092 62.4289Z" stroke="black" />
                                                                <path d="M13.1453 27.5754C13.1388 25.072 14.1299 22.6704 15.8974 20.8985C17.665 19.1267 20.0654 18.1311 22.569 18.1322C25.0714 18.1333 27.4707 19.1299 29.2372 20.9029C29.522 21.2347 29.9326 21.434 30.3696 21.4505C30.8066 21.468 31.2315 21.3015 31.5403 20.9916C31.8502 20.6828 32.0156 20.2579 31.9992 19.8209C31.9816 19.3839 31.7834 18.9744 31.4516 18.6896C29.0138 16.2464 25.678 14.9135 22.2285 15.0044C18.7776 15.0953 15.5174 16.6022 13.2123 19.1713C10.9071 21.7405 9.7606 25.1442 10.0418 28.5839C10.3232 32.0238 12.0076 35.1963 14.6993 37.3559C14.9797 37.5815 15.329 37.7031 15.6893 37.702C16.3486 37.6965 16.9345 37.2792 17.1557 36.6583C17.3769 36.0362 17.1853 35.343 16.6782 34.9225C14.4464 33.1363 13.1475 30.4335 13.1452 27.5753L13.1453 27.5754Z" stroke="black" />
                                                                <path d="M77.4526 15.0142C74.1211 15.012 70.9245 16.3327 68.5667 18.6883C68.2349 18.973 68.0367 19.3826 68.0192 19.8195C68.0028 20.2565 68.1681 20.6814 68.478 20.9902C68.7869 21.3002 69.2118 21.4666 69.6487 21.4491C70.0857 21.4327 70.4964 21.2334 70.7811 20.9015C72.6188 19.1099 75.1092 18.1462 77.6739 18.2327C80.2398 18.3192 82.6589 19.4494 84.3718 21.3615C86.0848 23.2735 86.9432 25.8023 86.7483 28.3616C86.5545 30.921 85.3235 33.2908 83.3403 34.9214C82.8333 35.3419 82.6416 36.0351 82.8628 36.6571C83.0841 37.2781 83.67 37.6953 84.3292 37.7008C84.6895 37.7019 85.0389 37.5804 85.3192 37.3548C88.0319 35.17 89.7152 31.9557 89.9669 28.481C90.2188 25.0071 89.0153 21.5837 86.6453 19.03C84.2765 16.4772 80.9527 15.0229 77.4693 15.0142L77.4526 15.0142Z" stroke="black" />
                                                                <path d="M39.8033 38.7842C36.3339 38.7842 27.2432 43.8712 27.2432 48.2046C27.2432 52.5381 30.0532 56.0546 33.5225 56.0546C36.9919 56.0546 42.943 50.9675 42.943 46.6341C42.943 42.3007 43.2727 38.7842 39.8033 38.7842Z" />
                                                                <path d="M60.214 38.7842C56.7446 38.7842 57.0743 42.3007 57.0743 46.6341C57.0743 50.9675 63.0243 56.0546 66.4948 56.0546C69.9642 56.0546 72.7741 52.5381 72.7741 48.2046C72.7741 43.8712 63.6845 38.7842 60.214 38.7842Z" />
                                                            </svg>
                                                        </div>
                                                        <div className="face-value">
                                                            <span className="lwr">?</span>
                                                        </div>
                                                    </div>

                                                    <div key={1} className="card" draggable={true}>
                                                        <div className="face-value">
                                                            <span className="cap">{hand.cards[0].faceVal}</span>
                                                        </div>
                                                        <div className="suit-icon">
                                                            {activeIconTheme[hand.cards[0].type.toLowerCase()]}
                                                        </div>
                                                        <div className="face-value">
                                                            <span className="lwr">{hand.cards[0].faceVal}</span>
                                                        </div>
                                                    </div>
                                                </> :
                                                hand.cards.map((card, id) => (
                                                    <div key={id} className="card" draggable={true}>
                                                        <div className="face-value">
                                                            <span className="cap">{card.faceVal}</span>
                                                        </div>
                                                        <div className="suit-icon">
                                                            {activeIconTheme[card.type.toLowerCase()]}
                                                        </div>
                                                        <div className="face-value">
                                                            <span className="lwr">{card.faceVal}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                        {hand.status && !hideCard ? <div className="status">{hand.status}</div> : null}
                                        <div className="count">{`${hideCard ? '??' : hand.val()}`}</div>
                                    </div>
                                    :
                                    <div key={'unplayed'} className="hand unplayed">
                                        <div className="cards">
                                            <div className="card" draggable={true}>
                                                <div className="face-value">
                                                    <span className="cap">B</span>
                                                </div>
                                                <div className="suit-icon">
                                                    <svg
                                                        className="icon panda"
                                                        viewBox="0 0 100 100"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M60.5771 25.5352H39.4454C34.1318 25.5395 29.0372 27.651 25.2788 31.4061C21.5204 35.1622 19.4045 40.2546 19.397 45.5684V64.5021C19.4046 69.8157 21.5204 74.908 25.2788 78.6645C29.0372 82.4199 34.1318 84.5312 39.4454 84.5354H60.5771C65.8906 84.531 70.9852 82.4196 74.7437 78.6645C78.5021 74.9083 80.6179 69.816 80.6255 64.5021V45.5684C80.6178 40.2549 78.502 35.1625 74.7437 31.4061C70.9852 27.6507 65.8906 25.5394 60.5771 25.5352V25.5352ZM77.4858 64.5016C77.4771 68.9816 75.6931 73.2769 72.5238 76.443C69.3533 79.6101 65.0572 81.3907 60.5771 81.3952H39.4454C34.9653 81.3908 30.6689 79.6101 27.4986 76.443C24.3292 73.2769 22.5454 68.9819 22.5367 64.5016V45.5679C22.5454 41.0878 24.3294 36.7925 27.4986 33.6265C30.6692 30.4593 34.9653 28.6788 39.4454 28.6743H60.5771C65.0572 28.6787 69.3536 30.4594 72.5238 33.6265C75.6932 36.7925 77.4771 41.0875 77.4858 45.5679V64.5016Z" stroke="black" />
                                                        <path d="M52.1447 54.579H49.4135C47.4039 54.579 45.3472 54.4224 44.0121 55.7091C43.2773 56.4615 42.8907 57.4854 42.9444 58.5345C42.9356 60.1444 43.4744 61.7081 44.4732 62.9686C45.4719 64.2302 46.8715 65.114 48.4388 65.4743V73.5126C48.4388 74.38 49.1419 75.083 50.0092 75.083C50.8766 75.083 51.5797 74.38 51.5797 73.5126V65.4743C53.1369 65.1162 54.5279 64.2423 55.5254 62.9938C56.523 61.7454 57.0684 60.1957 57.0739 58.5978C57.1713 57.4534 56.7968 56.3189 56.0379 55.4582C54.9165 54.6412 53.5081 54.3236 52.1446 54.5788L52.1447 54.579ZM50.0092 62.4289C47.8452 62.4201 46.0929 60.6679 46.0842 58.5039C46.0656 58.309 46.104 58.113 46.1938 57.9388C46.7753 57.6815 47.4148 57.584 48.0467 57.6563H49.3029H52.2707C52.8829 57.6563 53.6999 57.5775 53.8411 57.6563H53.84C53.9397 57.9378 53.978 58.2378 53.9495 58.5346C53.9495 60.7117 52.1853 62.4761 50.0092 62.4761L50.0092 62.4289Z" stroke="black" />
                                                        <path d="M13.1453 27.5754C13.1388 25.072 14.1299 22.6704 15.8974 20.8985C17.665 19.1267 20.0654 18.1311 22.569 18.1322C25.0714 18.1333 27.4707 19.1299 29.2372 20.9029C29.522 21.2347 29.9326 21.434 30.3696 21.4505C30.8066 21.468 31.2315 21.3015 31.5403 20.9916C31.8502 20.6828 32.0156 20.2579 31.9992 19.8209C31.9816 19.3839 31.7834 18.9744 31.4516 18.6896C29.0138 16.2464 25.678 14.9135 22.2285 15.0044C18.7776 15.0953 15.5174 16.6022 13.2123 19.1713C10.9071 21.7405 9.7606 25.1442 10.0418 28.5839C10.3232 32.0238 12.0076 35.1963 14.6993 37.3559C14.9797 37.5815 15.329 37.7031 15.6893 37.702C16.3486 37.6965 16.9345 37.2792 17.1557 36.6583C17.3769 36.0362 17.1853 35.343 16.6782 34.9225C14.4464 33.1363 13.1475 30.4335 13.1452 27.5753L13.1453 27.5754Z" stroke="black" />
                                                        <path d="M77.4526 15.0142C74.1211 15.012 70.9245 16.3327 68.5667 18.6883C68.2349 18.973 68.0367 19.3826 68.0192 19.8195C68.0028 20.2565 68.1681 20.6814 68.478 20.9902C68.7869 21.3002 69.2118 21.4666 69.6487 21.4491C70.0857 21.4327 70.4964 21.2334 70.7811 20.9015C72.6188 19.1099 75.1092 18.1462 77.6739 18.2327C80.2398 18.3192 82.6589 19.4494 84.3718 21.3615C86.0848 23.2735 86.9432 25.8023 86.7483 28.3616C86.5545 30.921 85.3235 33.2908 83.3403 34.9214C82.8333 35.3419 82.6416 36.0351 82.8628 36.6571C83.0841 37.2781 83.67 37.6953 84.3292 37.7008C84.6895 37.7019 85.0389 37.5804 85.3192 37.3548C88.0319 35.17 89.7152 31.9557 89.9669 28.481C90.2188 25.0071 89.0153 21.5837 86.6453 19.03C84.2765 16.4772 80.9527 15.0229 77.4693 15.0142L77.4526 15.0142Z" stroke="black" />
                                                        <path d="M39.8033 38.7842C36.3339 38.7842 27.2432 43.8712 27.2432 48.2046C27.2432 52.5381 30.0532 56.0546 33.5225 56.0546C36.9919 56.0546 42.943 50.9675 42.943 46.6341C42.943 42.3007 43.2727 38.7842 39.8033 38.7842Z" />
                                                        <path d="M60.214 38.7842C56.7446 38.7842 57.0743 42.3007 57.0743 46.6341C57.0743 50.9675 63.0243 56.0546 66.4948 56.0546C69.9642 56.0546 72.7741 52.5381 72.7741 48.2046C72.7741 43.8712 63.6845 38.7842 60.214 38.7842Z" />
                                                    </svg>
                                                </div>
                                                <div className="face-value">
                                                    <span className="lwr">J</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="count">--</div>
                                    </div>
                            ))}
                        </div>

                        <div className="watermark">
                            <span>BLACKJACK PAYS 3:2</span>
                            <span className="dealer">DEALER HITS ON SOFT 17</span>
                            <span className='insurance'>INSURANCE PAYS 2:1</span>
                        </div>

                        <div className="hands player">
                            {player.hands.map((hand, idx) => (
                                (hand.val() > 0)
                                    ? (<div key={idx} className={`hand ${idx === id ? 'active' : ''} ${hand.status ? 'statued' : ''}`} >
                                        <div className="count">{hand.val()}</div>
                                        {hand.status && hand.status !== 'SPLIT' ? <div className="status">{hand.status}</div> : null}
                                        <div className="cards">
                                            {hand.cards.map((card, id) => (
                                                <div key={id} className='card' draggable={true}>
                                                    <div className="face-value">
                                                        <span className="cap">{card.faceVal}</span>
                                                    </div>
                                                    <div className="suit-icon">
                                                        {activeIconTheme[card.type.toLowerCase()]}
                                                    </div>
                                                    <div className="face-value">
                                                        <span className="lwr">{card.faceVal}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bet">{hand.bet}</div>
                                    </div>)
                                    : // To show a blank card prior to any card being dealt
                                    (<div key={'unplayed'} className="hand unplayed">
                                        <div className="count">--</div>
                                        <div className="cards">
                                            <div className="card" draggable={true}>
                                                <div className="face-value">
                                                    <span className="cap">J</span>
                                                </div>
                                                <div className="suit-icon">
                                                    <svg
                                                        className="icon panda"
                                                        viewBox="0 0 100 100"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M60.5771 25.5352H39.4454C34.1318 25.5395 29.0372 27.651 25.2788 31.4061C21.5204 35.1622 19.4045 40.2546 19.397 45.5684V64.5021C19.4046 69.8157 21.5204 74.908 25.2788 78.6645C29.0372 82.4199 34.1318 84.5312 39.4454 84.5354H60.5771C65.8906 84.531 70.9852 82.4196 74.7437 78.6645C78.5021 74.9083 80.6179 69.816 80.6255 64.5021V45.5684C80.6178 40.2549 78.502 35.1625 74.7437 31.4061C70.9852 27.6507 65.8906 25.5394 60.5771 25.5352V25.5352ZM77.4858 64.5016C77.4771 68.9816 75.6931 73.2769 72.5238 76.443C69.3533 79.6101 65.0572 81.3907 60.5771 81.3952H39.4454C34.9653 81.3908 30.6689 79.6101 27.4986 76.443C24.3292 73.2769 22.5454 68.9819 22.5367 64.5016V45.5679C22.5454 41.0878 24.3294 36.7925 27.4986 33.6265C30.6692 30.4593 34.9653 28.6788 39.4454 28.6743H60.5771C65.0572 28.6787 69.3536 30.4594 72.5238 33.6265C75.6932 36.7925 77.4771 41.0875 77.4858 45.5679V64.5016Z" stroke="black" />
                                                        <path d="M52.1447 54.579H49.4135C47.4039 54.579 45.3472 54.4224 44.0121 55.7091C43.2773 56.4615 42.8907 57.4854 42.9444 58.5345C42.9356 60.1444 43.4744 61.7081 44.4732 62.9686C45.4719 64.2302 46.8715 65.114 48.4388 65.4743V73.5126C48.4388 74.38 49.1419 75.083 50.0092 75.083C50.8766 75.083 51.5797 74.38 51.5797 73.5126V65.4743C53.1369 65.1162 54.5279 64.2423 55.5254 62.9938C56.523 61.7454 57.0684 60.1957 57.0739 58.5978C57.1713 57.4534 56.7968 56.3189 56.0379 55.4582C54.9165 54.6412 53.5081 54.3236 52.1446 54.5788L52.1447 54.579ZM50.0092 62.4289C47.8452 62.4201 46.0929 60.6679 46.0842 58.5039C46.0656 58.309 46.104 58.113 46.1938 57.9388C46.7753 57.6815 47.4148 57.584 48.0467 57.6563H49.3029H52.2707C52.8829 57.6563 53.6999 57.5775 53.8411 57.6563H53.84C53.9397 57.9378 53.978 58.2378 53.9495 58.5346C53.9495 60.7117 52.1853 62.4761 50.0092 62.4761L50.0092 62.4289Z" stroke="black" />
                                                        <path d="M13.1453 27.5754C13.1388 25.072 14.1299 22.6704 15.8974 20.8985C17.665 19.1267 20.0654 18.1311 22.569 18.1322C25.0714 18.1333 27.4707 19.1299 29.2372 20.9029C29.522 21.2347 29.9326 21.434 30.3696 21.4505C30.8066 21.468 31.2315 21.3015 31.5403 20.9916C31.8502 20.6828 32.0156 20.2579 31.9992 19.8209C31.9816 19.3839 31.7834 18.9744 31.4516 18.6896C29.0138 16.2464 25.678 14.9135 22.2285 15.0044C18.7776 15.0953 15.5174 16.6022 13.2123 19.1713C10.9071 21.7405 9.7606 25.1442 10.0418 28.5839C10.3232 32.0238 12.0076 35.1963 14.6993 37.3559C14.9797 37.5815 15.329 37.7031 15.6893 37.702C16.3486 37.6965 16.9345 37.2792 17.1557 36.6583C17.3769 36.0362 17.1853 35.343 16.6782 34.9225C14.4464 33.1363 13.1475 30.4335 13.1452 27.5753L13.1453 27.5754Z" stroke="black" />
                                                        <path d="M77.4526 15.0142C74.1211 15.012 70.9245 16.3327 68.5667 18.6883C68.2349 18.973 68.0367 19.3826 68.0192 19.8195C68.0028 20.2565 68.1681 20.6814 68.478 20.9902C68.7869 21.3002 69.2118 21.4666 69.6487 21.4491C70.0857 21.4327 70.4964 21.2334 70.7811 20.9015C72.6188 19.1099 75.1092 18.1462 77.6739 18.2327C80.2398 18.3192 82.6589 19.4494 84.3718 21.3615C86.0848 23.2735 86.9432 25.8023 86.7483 28.3616C86.5545 30.921 85.3235 33.2908 83.3403 34.9214C82.8333 35.3419 82.6416 36.0351 82.8628 36.6571C83.0841 37.2781 83.67 37.6953 84.3292 37.7008C84.6895 37.7019 85.0389 37.5804 85.3192 37.3548C88.0319 35.17 89.7152 31.9557 89.9669 28.481C90.2188 25.0071 89.0153 21.5837 86.6453 19.03C84.2765 16.4772 80.9527 15.0229 77.4693 15.0142L77.4526 15.0142Z" stroke="black" />
                                                        <path d="M39.8033 38.7842C36.3339 38.7842 27.2432 43.8712 27.2432 48.2046C27.2432 52.5381 30.0532 56.0546 33.5225 56.0546C36.9919 56.0546 42.943 50.9675 42.943 46.6341C42.943 42.3007 43.2727 38.7842 39.8033 38.7842Z" />
                                                        <path d="M60.214 38.7842C56.7446 38.7842 57.0743 42.3007 57.0743 46.6341C57.0743 50.9675 63.0243 56.0546 66.4948 56.0546C69.9642 56.0546 72.7741 52.5381 72.7741 48.2046C72.7741 43.8712 63.6845 38.7842 60.214 38.7842Z" />
                                                    </svg>
                                                </div>
                                                <div className="face-value">
                                                    <span className="lwr">B</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bet">--</div>
                                    </div>)
                            ))}
                        </div>
                    </div>
                </div>

                <div className="board-actions">
                    <div className="top-board-actions"> {player.insurance > 0 &&
                        <button className="ctrl insurance" id="insurance">
                            {`$${player.insurance}`}
                            <div className="tooltip">Insurance</div>
                        </button>
                    } </div>

                    <div className="inner-actions">
                        {Object.entries(activeActionButtons).map((button) => (
                            button[1]
                        ))}
                    </div>

                    {<button className="ctrl action-btn primary" id="action-btn" onClick={() => {
                        if (playBtn === 'Stand') {
                            setPlayer({ type: `${playBtn.toUpperCase()}` });
                            setPlayBtn('Stand');
                        } else {
                            setBalance!(player.balance)
                            setActiveModal!('place-bet-modal')
                        }
                    }}> {playBtn} </button>}
                </div>
            </div>
        </div>
    )
}

export default Main