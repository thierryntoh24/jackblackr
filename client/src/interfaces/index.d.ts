import { User } from 'firebase/auth'

interface Card {
    faceVal: string,
    val: number[],
    type: string
}

interface Hand {
    cards: Card[]
    bet: number
    status: string
    val(): number
}

interface Player {
    hands: Hand[],
    balance: number,
    insurance: number
}
/** Reducer actions. */
interface PlayerActions { type: 'DOUBLE' | 'SPLIT' | 'HIT' | 'STAND' | 'INSURE' | 'SURRENDER' | 'PLAY' | string }

/** Context interface for all general cross-component data */
interface MainContextInterface {
    user: AuthUserInterface
    activeModal: string;
    balance: number
    activeIconTheme: { [key: string]: JSX.Element }
    bet: number
    previousBets: number[]
    isLoading: boolean
    darkTheme: boolean
    authing: boolean
    restart: boolean
    error: string
    setUser?: React.Dispatch<React.SetStateAction<AuthUserInterface>>
    setActiveModal?: React.Dispatch<React.SetStateAction<string>>;
    setActiveIconTheme?: React.Dispatch<React.SetStateAction<{ [key: string]: JSX.Element }>>
    setBalance?: React.Dispatch<React.SetStateAction<number>>
    setBet?: React.Dispatch<React.SetStateAction<number>>
    setPreviousBets?: React.Dispatch<React.SetStateAction<number[]>>
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>
    toggleDarkTheme?: React.Dispatch<React.SetStateAction<boolean>>
    toggleAuthing?: React.Dispatch<React.SetStateAction<boolean>>
    toggleRestart?: React.Dispatch<React.SetStateAction<boolean>>
    setError?: React.Dispatch<React.SetStateAction<string>>
}

/** An authenticated user account derived from Firebase. */
interface AuthUserInterface {
    uid: string
    name: string
    email: string
    token: string
    isLoggedIn: boolean
}

/** A user retrived from the database. Very different from an AuthUser */
//Reason is i dont wanna send all user data to the DB. Also, don't wanna deal with unneccesary data in the Firebase user object
interface DBUserInterface extends Document {
    uid: string
    name: string
    balance: number
    highscores: {
        week: number
        month: number
        all_time: number
    }
}

export { Card, Hand, Player, PlayerActions, MainContextInterface, AuthUserInterface, DBUserInterface }