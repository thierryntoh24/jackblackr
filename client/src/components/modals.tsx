import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import {
    createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword,
    sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider
} from 'firebase/auth'
import { auth, getAllUserScores, iconThemes } from '../app'
import { DBUserInterface } from '../interfaces'
import { useMainContext } from '../app'
import logger from '../config/logging'
import './modal.css'

//All modals is one place. Controversial.

interface SignBodySpecs {
    text: string
    setText: Dispatch<SetStateAction<string>>
}


interface SignFeildProps {
    emailRef: React.MutableRefObject<HTMLInputElement | null>
    passRef: React.MutableRefObject<HTMLInputElement | null>
    nameRef?: React.MutableRefObject<HTMLInputElement | null>
    countryRef?: React.MutableRefObject<HTMLInputElement | null>
    pass2Ref?: React.MutableRefObject<HTMLInputElement | null>
    formErrs: {
        password: string;
        pass2: string;
    }
}

const
    IconThemeModal = () => {
        const { activeIconTheme, setActiveIconTheme } = useMainContext()

        return (
            <>
                <div className="modal-body">
                    {Object.entries(iconThemes).map((theme, idx) => (
                        <div key={idx}
                            className={`icon-theme ${theme[0]} ${activeIconTheme === theme[1] ? 'active' : null}`}
                            onClick={() => { setActiveIconTheme!(theme[1]); localStorage.setItem('icon-theme', theme[0]) }}
                        >
                            {Object.entries(theme[1]).map((suit) => (
                                suit[1]
                            ))}
                        </div>
                    ))}
                </div>

                <div className="modal-footer">
                    <span>Icons by {' '}
                        <a href="https://thenounproject.com/rohan130/" target="_blank" rel="noopener noreferrer">Rohan Farrel</a> from {' '}
                        <a href="https://thenounproject.com" target="_blank" rel="noopener noreferrer">NounProject.com</a>
                    </span>
                </div>
            </>
        )
    },

    ScoreboardModal = () => {
        const { user } = useMainContext(),
            [allPlayers, setAllPlayers] = useState<DBUserInterface[]>([]),
            [sorted, setSorted] = useState<{
                name: string,
                uid: string,
                score: number
            }[]>([]),
            [loading, toggleLoading] = useState(true),
            [activePill, setActivePill] = useState('week'),

            sortByScoreType = (type: string): typeof sorted => {
                if (type === 'week')
                    return allPlayers.sort((a, b) => b.highscores.week - a.highscores.week)
                        .slice(0, 14).map((player) => ({ name: player.name, uid: player.uid, score: player.highscores.week }))
                else if (type === 'month')
                    return allPlayers.sort((a, b) => b.highscores.month - a.highscores.month)
                        .slice(0, 14).map((player) => ({ name: player.name, uid: player.uid, score: player.highscores.month }))
                else return allPlayers.sort((a, b) => b.highscores.all_time - a.highscores.all_time)
                    .slice(0, 14).map((player) => ({ name: player.name, uid: player.uid, score: player.highscores.all_time }))
            }

        useEffect(() => {
            getAllUserScores((error, users) => {
                toggleLoading(true)
                if (error) logger.error(error)
                if (users && users !== []) {
                    logger.info(`RETRIVED :: ${users.length} users.`)
                    setAllPlayers(users)
                }
            }).then(() => { setSorted(sortByScoreType('week')); })
        }, [])

        useEffect(() => { if (allPlayers.length > 0) setSorted(sortByScoreType('week')) /* eslint-disable-next-line */ }, [allPlayers])

        useEffect(() => { if (sorted.length > 0) toggleLoading(false) }, [sorted])

        return (
            <>
                <div className="modal-inner">
                    <div className="score-nav">
                        <div className={`score-nav-item ${activePill === 'week' ? 'active' : ''}`} onClick={() => { setSorted(sortByScoreType('week')); setActivePill('week') }}>This week</div>
                        <div className={`score-nav-item ${activePill === 'month' ? 'active' : ''}`} onClick={() => { setSorted(sortByScoreType('month')); setActivePill('month') }}>This month</div>
                        <div className={`score-nav-item ${activePill === 'all_time' ? 'active' : ''}`} onClick={() => { setSorted(sortByScoreType('all_time')); setActivePill('all_time') }}>All time</div>
                    </div>

                    <div className="modal-body">
                        {loading ? (
                            <div className="score-item">
                                <span className="id">##</span>
                                <span className="name">Loading...</span>
                                <span className="amount">$00000</span>
                            </div>
                        ) :
                            sorted.map((player, idx) => (
                                <div className="score-item" key={idx}>
                                    <span className="id">#{idx + 1}</span>
                                    <span className="name">{player.name.split(' ')[0]}</span>
                                    {player.uid === user.uid && <div className="country">(you)</div>}
                                    <span className="amount">${player.score}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </>
        )
    },

    HelpModal = () => (
        <div className="modal-body" id='scroll-help'>
            <div className="paragraph">
                <h2 className="title">What is Blackjack?</h2>
                <p className="content">
                    The most widely played casino banking game in the world, descends from a global family of casino banking games known as Twenty-One. The rules are simple, the play is thrilling, and there is opportunity for high strategy.
                </p>
            </div>
            <div className="paragraph">
                <h2 className="title">Objective of the game</h2>
                <p className="content">
                    The objective is simply to beat the dealer, increase your balance and eventially earn first position on the Scoreboard. This can be done by; drawing a hand value that is higher than the dealer’s hand value, the dealer drawing a hand value that goes over 21 or by drawing a hand value of 21 on your first two cards, when the dealer does not.
                </p>
                <p className="content">
                    The game is played in sessions. A single session can go on for as long as the player's balance doesn't run out. When the balance does, the player can choose to start a new session. This wil effectively reset the game to default.
                </p>
            </div>
            <div className="paragraph">
                <h2 className="title">The pack.</h2>
                <p className="content">
                    The standard 52-card pack is used.
                </p>
            </div>
            <div className="paragraph">
                <h2 className="title">Card values</h2>
                <p className="content">
                    Cards from 2-10 are valued at their face values (for example an 8 of spades has a value of 8). Cards J, Q & K all have a value of 10. The ace is valued at either 1 or 10. It is up to the player if an ace is worth 1 or 11.
                </p>
            </div>
            <div className="paragraph">
                <h2 className="title">Betting</h2>
                <p className="content">
                    Before the deal begins, the player places a bet. The only limits are the player's balance.
                </p>
            </div>
            <div className="paragraph">
                <h2 className="title">Dealing</h2>
                <p className="content">
                    When the bet has been placed, the dealer gives one card face up to the player, and then one card face up to themselves. Another round of cards is then dealt face up to the player, but the dealer takes the second card face down. Thus, the player receives two cards face up, and the dealer receives one card face up and one card face down.
                </p>
            </div>
            <div className="paragraph">
                <h2 className="title">Playing</h2>
                <p className="content">
                    The player goes first and must decide whether to "stand" (not ask for another card) or "hit" (ask for another card in an attempt to get closer to a count of 21, or even hit 21 exactly). Thus, a player may stand on the two cards originally dealt to them, or they may ask the dealer for additional cards, one at a time, until deciding to stand on the total (if it is 21 or under), or goes "bust" (if it is over 21). In the latter case, the player loses that hand and the dealer collects the bet wagered. In case the player has multiple hands, the dealer then turns to the next hand and serves it in the same manner.
                </p>
                <p className="content">
                    The combination of an ace with a card other than a ten-card is known as a "soft hand," because the player can count the ace as a 1 or 11, and either draw cards or not. For example with a "soft 17" (an ace and a 6), the total is 7 or 17. While a count of 17 is a good hand, the player may wish to draw for a higher total. If the draw creates a bust hand by counting the ace as an 11, the player simply counts the ace as a 1 and continues playing by standing or "hitting" (asking the dealer for additional cards, one at a time).
                </p>
                <p className="content">
                    When the dealer has served every hand, the dealers face-down card is turned up. If the total is 17 or more, it must stand. If the total is 16 or under, they must take a card. The dealer must continue to take cards until the total is 17 or more, at which point the dealer must stand. If the dealer has an ace, and counting it as 11 would bring the total to 17 or more (but not over 21), the dealer will count the ace as 1 and take another card. The dealer's decisions, then, are automatic on all plays, whereas the player always has the option of taking one or more cards.
                </p>
                <h4 className="title">Hitting</h4>
                <p className="content">
                    If the player would like more cards to improve their hand total, the dealer will deal them more cards, one at a time, until they either “bust” (go over 21) or choose to stand. There is no limit on the number of cards they can take (other than going over a total of 21).
                </p>
                <h4 className="title">Splitting</h4>
                <p className="content">
                    If a player is dealt two cards are of the same value, such as two jacks, two sixes or a king and a ten, they may choose to treat them as two separate hands. This is called splitting. By so doing, the two cards are separated and a card drawn to each. The amount of the original bet then goes on one of the 'hands', and an equal amount must be placed as a bet on the other 'hand'. The two hands are thus treated separately, and the dealer settles with each on its own merits. With a pair of aces, the player is given one card for each ace and may not draw again. Also, if a ten-card is dealt to one of these aces, the payoff is equal to the bet (not one and one-half to one, as with a blackjack at any other time).
                </p>
                <h4 className="title">Doubling</h4>
                <p className="content">
                    Another option open to the player is doubling their bet. If they have a hand total that is advantageous to they but they need to take an additional card they can double down by adding a bet equal to the original bet, and the dealer gives the player just one more card. With two fives, the player may split a pair, double down, or just play the hand in the regular way. Note that the dealer does not have the option of splitting or doubling down.
                </p>
                <h4 className="title">Insuring</h4>
                <p className="content">
                    When the dealer's face-up card is an ace, the players may make a side bet of up to half the original bet that the dealer's face-down card will be a ten-card, and thus a blackjack for the house. Once such a side bet is placed, gameplay continues as usual. When it's the dealer's turn to play, he flips over the face-down card. If it is a ten-card, player wins on the insurance bet is paid double the amount of that bet - a 2 to 1 payoff. When a blackjack occurs for the dealer, of course, the hand is over, and the players' main bets are collected - unless a player also has blackjack, in which case it is a stand-off. Insurance is invariably not a good proposition for the player, unless they are quite sure that there is a high probability of a ten-card being drawn. Note: the player can insure just once.
                </p>
                <h4 className="title">Surrendering</h4>
                <p className="content">
                    If the player doesn’t like their initial hand, they have the option of giving it up in exchange for half their original bet back.
                </p>
            </div>
            <div className="paragraph">
                <h2 className="title">Settlement</h2>
                <p className="content">
                    A bet once paid and collected is never returned. Thus, one key advantage to the dealer is that the player goes first. If the player goes bust, they have already lost their wager, even if the dealer goes bust as well. If the dealer goes over 21, the dealer pays each hand still below 21 the amount of that hand's bet. If the dealer stands at 21 or less, the dealer pays the bet of any hand having a higher total (not exceeding 21) and collects the bet of any hand having a lower total. If there is a stand-off (a player having the same total as the dealer), no bets are paid out nor collected.
                </p>
                <p className="content">
                    If a player's first two cards are an ace and a "ten-card" (a picture card or 10), giving a count of 21 in two cards, this is a natural or "blackjack." If any player has a natural and the dealer does not, the dealer immediately pays that player one and a half times the amount of their bet. If the dealer has a natural, they immediately collect the bets of all players who do not have naturals, (but no additional amount). If the dealer and another player both have naturals, the bet of that player is a stand-off (a tie), and the player takes back his bet.
                </p>
            </div>
            <div className="paragraph">
                <h2 className="title">Basic strategy</h2>
                <p className="content">
                    Winning tactics in Blackjack require that the player play each hand in the optimum way, and such strategy always takes into account what the dealer's upcard is. When the dealer's upcard is a good one, a 7, 8, 9, 10-card, or ace for example, the player should not stop drawing until a total of 17 or more is reached. When the dealer's upcard is a poor one, 4, 5, or 6, the player should stop drawing as soon as he gets a total of 12 or higher. The strategy here is never to take a card if there is any chance of going bust. The desire with this poor holding is to let the dealer hit and hopefully go over 21. Finally, when the dealer's up card is a fair one, 2 or 3, the player should stop with a total of 13 or higher.
                </p>
                <p className="content">
                    With a soft hand, the general strategy is to keep hitting until a total of at least 18 is reached. Thus, with an ace and a six (7 or 17), the player would not stop at 17, but would hit.

                    The basic strategy for doubling down is as follows: With a total of 11, the player should always double down. With a total of 10, he should double down unless the dealer shows a ten-card or an ace. With a total of 9, the player should double down only if the dealer's card is fair or poor (2 through 6).
                </p>
                <p className="content">
                    For splitting, the player should always split a pair of aces or 8s; identical ten-cards should not be split, and neither should a pair of 5s, since two 5s are a total of 10, which can be used more effectively in doubling down. A pair of 4s should not be split either, as a total of 8 is a good number to draw to. Generally, 2s, 3s, or 7s can be split unless the dealer has an 8, 9, ten-card, or ace. Finally, 6s should not be split unless the dealer's card is poor (2 through 6).
                </p>
            </div>
        </div>
    ),

    SignUpFormFields = ({ nameRef, emailRef, passRef, pass2Ref, formErrs }: SignFeildProps) => (
        <div className="form-fields">
            <input className='form-input' type="text" id="display" placeholder='Display name' required ref={nameRef} />
            <input className='form-input' type="email" id="email" placeholder='Email' required ref={emailRef} />
            <input className='form-input' type='password' id="password" placeholder='Password' required ref={passRef} />
            {formErrs.password !== '' && <span>{formErrs.password}</span>}
            <input className='form-input' type='password' id="password2" placeholder='Confirm password' required ref={pass2Ref} />
            {formErrs.pass2 !== '' && <span>{formErrs.pass2}</span>}
        </div>
    ),

    SignInFormFields = ({ emailRef, passRef, formErrs }: SignFeildProps) => (
        <div className="form-fields">
            <input className='form-input' type="email" id="email" placeholder='Email' required ref={emailRef} />
            <input className='form-input' type='password' id="password" placeholder='Password' required ref={passRef} />
            {formErrs.password !== '' && <span>{formErrs.password}</span>}
        </div>
    ),

    SignInBody = ({ text, setText }: SignBodySpecs) => {
        const init = { password: '', pass2: '', valid: true },
            nameRef = useRef<HTMLInputElement | null>(null),
            emailRef = useRef<HTMLInputElement | null>(null),
            passRef = useRef<HTMLInputElement | null>(null),
            pass2Ref = useRef<HTMLInputElement | null>(null),
            txt = text === 'up' ? 'in' : 'up',
            { authing, toggleAuthing, setError, setActiveModal } = useMainContext(),
            [formErrs, setFormErrs] = useState(init),

            userSignUp = async (name: string, email: string, password: string) => {
                toggleAuthing!(true)
                await createUserWithEmailAndPassword(auth, email, password)
                    .then((user) => {
                        if (user)
                            (updateProfile(auth.currentUser!, { displayName: name }))
                                .then(() => {
                                    logger.info('Succesfully signed up! ' + user.user.displayName)
                                    window.location.reload()
                                })
                    })
                    .catch(error => { logger.error(error); setError!(error.message!) })
                    .finally(() => { toggleAuthing!(false); window.location.reload() })
            },

            userSignIn = async (email: string, password: string) => {
                toggleAuthing!(true)
                await signInWithEmailAndPassword(auth, email, password)
                    .then(res => { logger.info('Succesfully signed in! ' + res.user.email); window.location.reload() })
                    .catch(error => { logger.error(error); setError!(error.message!) })
                    .finally(() => toggleAuthing!(false))
            },

            googleSignIn = async () => {
                toggleAuthing!(true)
                await signInWithPopup(auth, new GoogleAuthProvider())
                    .then(res => { logger.info('Successfully logged in with Google ' + res.user.displayName); window.location.reload() })
                    .catch(error => { logger.error(error); setError!(error.message!); })
                    .finally(() => toggleAuthing!(false))
            },

            handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault()
                const
                    name = nameRef.current?.value,
                    email = emailRef.current?.value,
                    pass = passRef.current?.value,
                    pass2 = pass2Ref.current?.value

                setFormErrs(validate(pass, pass2))

                if (validate(pass, pass2).valid && (email && pass))
                    if (text === 'up' && name)
                        userSignUp(name, email, pass);
                    else userSignIn(email, pass)
            },

            validate = (pass: string | undefined, pass2: string | undefined) => {
                const errors = { ...init }

                // if (email && regex.length < 4) { errors.password = 'Password has to be longer than 4 characters'; errors.valid = false }
                if (pass && pass.length < 4) { errors.password = 'Password has to be longer than 4 characters'; errors.valid = false }
                if (!pass2) { errors.pass2 = 'You must confirm your password'; errors.valid = false }
                else if (pass2 !== pass) { errors.pass2 = 'Passwords do not match'; errors.valid = false }

                return errors
            }

        return (
            <>
                <button className="google-signup primary" onClick={() => googleSignIn()} disabled={authing}>
                    <svg
                        className="icon google"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="https://www.w3.org/2000/svg"
                    >
                        <path d="M86.8971 43.1725C86.8275 42.7808 86.4842 42.5 86.0862 42.5H50.8333C50.3729 42.5 50 42.8729 50 43.3333V56.6667C50 57.1271 50.3729 57.5 50.8333 57.5H71.1933C68.1012 66.2317 59.7929 72.5 50 72.5C37.5744 72.5 27.5 62.4254 27.5 50C27.5 37.5744 37.5744 27.5 50 27.5C55.4529 27.5 60.4383 29.4558 64.3308 32.6859C64.6704 32.9677 65.1704 32.9544 65.4825 32.6423L74.9233 23.2016C75.2571 22.868 75.2479 22.3237 74.8958 22.0099C68.2721 16.1113 59.5671 12.5 50 12.5C29.2906 12.5 12.5 29.2906 12.5 50C12.5 70.7096 29.2906 87.5 50 87.5C70.7096 87.5 87.5 70.7096 87.5 50C87.5 47.7208 87.2875 45.3633 86.8971 43.1725Z" />
                    </svg>
                    Sign {text} with Google
                </button>

                <span className="alt-text">Or sign {text} with email</span>

                <form action="" className="email-form" onSubmit={(event) => handleSubmit(event)}>
                    {
                        text === 'up'
                            ? <SignUpFormFields nameRef={nameRef} emailRef={emailRef} passRef={passRef} pass2Ref={pass2Ref} formErrs={formErrs} />
                            : <SignInFormFields emailRef={emailRef} passRef={passRef} formErrs={formErrs} />
                    }

                    <div className="form-footer">
                        <button className='signup-btn' type='submit'>Sign {text}</button>
                        <span>
                            {text === 'up' ? 'Already have an account? ' : "Don't have an account? "}
                            <span className='alt-sign'
                                onClick={() => {
                                    text === 'up' ? setText('in') : setText('up')
                                }}
                            >
                                Sign {txt} here
                            </span>
                        </span>
                        {text === 'in' && <span className='pass' onClick={() => setText('forgot')}>Forgot password?</span>}
                    </div>
                </form>

                <div className="modal-footer">
                    <button className="guest" onClick={() => setActiveModal!('')} disabled={authing}>Continue as guest</button>
                </div>
            </>
        )
    },

    ForgotPasswordBody = () => {
        const { setActiveModal, setError } = useMainContext(),
            [email, setEmail] = useState<string>(),

            forgotPassword = async (email: string) => (
                await sendPasswordResetEmail(auth, email)
                    .then(() => setActiveModal!(''))
                    .catch(error => { logger.error(error); setError!(error.message); })
            )

        return (
            <form action="" className="email-form" onSubmit={event => {
                event.preventDefault()
                if (email) forgotPassword(email)
            }}>
                <div className="form-fields">
                    <input
                        className='form-input'
                        type="email"
                        placeholder='Email'
                        required
                        onChange={(e) => setEmail(e.currentTarget.value)}
                    />
                    <span>A reset link will be sent to your email.</span>
                </div>

                <div className="form-footer">
                    <button className='signup-btn' type='submit'>Reset password</button>
                </div>
            </form >
        )
    },

    SignUpModal = ({ text, setText }: SignBodySpecs) => {
        const { error } = useMainContext()
        return (
            <div className="modal-body">
                {error !== '' && <div className="error">{error}</div>}
                {text === 'forgot' ? <ForgotPasswordBody /> : <SignInBody text={text} setText={setText} />}
            </div>
        )
    },

    PlaceBetModal = () => {
        const
            { balance, previousBets, setBet, setPreviousBets, setActiveModal, toggleRestart } = useMainContext(),
            [loading, toggle] = useState(false),
            [input, setInput] = useState<number>(0)

        useEffect(() => {
            setInput(0)
            // eslint-disable-next-line
        }, [setBet])

        return (
            <div className="modal-body">
                <div className="bet-form">
                    <span className='balance'> Your balance is {balance} </span>

                    {balance > 0 ? <>
                        <div className="form-fields">
                            <input
                                className='form-input' type="number"
                                min={1} max={balance} maxLength={6}
                                placeholder='Enter amount to bet'
                                value={input !== 0 ? input : ''}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    !isNaN(val) ? setInput(val) : setInput(0)
                                }}
                            />
                            {(input < 0 || isNaN(input) || balance - input < 0) ? <span>You can't place this bet</span> : null}
                        </div>
                        {previousBets.length > 0 &&
                            <div className="prev-bets">
                                {previousBets.slice(0, 4).map((pbet, id) => (
                                    <div key={id} className="bet-pill" onClick={() => setInput(pbet)}>${pbet}</div>
                                ))}
                            </div>
                        }
                        <div className="form-footer">
                            <button className="place-bet"
                                onClick={() => {
                                    if (balance - input >= 0 && input > 0 && !isNaN(input)) {
                                        toggle(true) // trying to get those slow-effects, man
                                        setActiveModal!('')
                                        setTimeout(() => {
                                            !previousBets.includes(input) ? setPreviousBets!([input, ...previousBets]) : setPreviousBets!(previousBets)
                                            setBet!(Math.floor(input))
                                            toggle(false)
                                        }, 800)
                                    }
                                }} disabled={loading}
                            >Place bet</button>
                        </div>
                    </>
                        :
                        <div className="form-footer">
                            <button className="place-bet"
                                onClick={() => {
                                    toggle(true)
                                    setTimeout(() => {
                                        setActiveModal!('')
                                        toggleRestart!(true)
                                        toggle(false)
                                    }, 3000)
                                }} disabled={loading}
                            >
                                {loading ? 'Starting new session...' : 'Start new session'}
                            </button>
                        </div>
                    }
                </div>
            </div >
        )
    },

    Modal = () => {
        const
            { activeModal, setActiveModal } = useMainContext(),
            [text, setText] = useState('up'),
            signName = text === 'forgot' ? 'Reset password' : `Sign ${text}`,
            modals: {
                [key: string]: {
                    name: string,
                    modal: JSX.Element
                }
            } = {
                'icon-theme-modal': {
                    name: 'Change icon theme',
                    modal: <IconThemeModal />
                },
                'score-modal': {
                    name: 'Scoreboard',
                    modal: <ScoreboardModal />
                },
                'help-modal': {
                    name: 'Help',
                    modal: <HelpModal />
                },
                'sign-up-modal': {
                    name: signName,
                    modal: <SignUpModal text={text} setText={setText} />
                },
                'place-bet-modal': {
                    name: 'Place your bet',
                    modal: <PlaceBetModal />
                }
            }

        return (
            <div className="modal-overlay scrollable" >
                <div className={`modal ${activeModal}`}>
                    <div className="modal-header">
                        <h2 className="modal-title">{modals[activeModal].name}</h2>
                        <svg
                            className="icon close-modal"
                            onClick={() => setActiveModal!("")}
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M49.9999 44.1074L23.4834 17.5908L17.5908 23.4834L44.1074 49.9999L17.5908 76.5166L23.4834 82.4091L49.9999 55.8924L76.5166 82.4091L82.4091 76.5166L55.8924 49.9999L82.4091 23.4834L76.5166 17.5908L49.9999 44.1074Z" />
                        </svg>
                    </div>

                    {modals[activeModal].modal}

                </div>
            </div >
        )
    }

export default Modal
