import { createContext, FunctionComponent, useContext, useEffect, useState } from "react"
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import {LoadingScreen, AuthLoader } from "./components/loader"
import { MainContextInterface, AuthUserInterface, DBUserInterface } from "./interfaces"
import { initializeApp } from 'firebase/app'
import Navbar from "./components/navbar"
import Modal from "./components/modals"
import logger from "./config/logging"
import Main from "./components/main"
import config from "./config"
import axios from "axios"

export const
    iconThemes: { [key: string]: MainContextInterface["activeIconTheme"] } = {
        'theme-1': {
            'clubs': <svg
                key={1}
                className="icon clubs"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M65.4462 87.5H34.8103L50.1286 72.1817L65.4462 87.5ZM50.1279 17.2871C47.3165 17.2744 44.6158 18.3809 42.6224 20.363C40.6284 22.3451 39.5059 25.0391 39.5011 27.8498C39.4971 30.6612 40.6116 33.3586 42.5997 35.346C44.5878 37.3341 47.285 38.4493 50.0959 38.4446C52.9073 38.4406 55.6013 37.3174 57.5834 35.324C59.5648 33.3299 60.672 30.6292 60.6593 27.8178C60.6439 25.0297 59.5294 22.3598 57.5579 20.3885C55.5859 18.4164 52.9161 17.3018 50.1279 17.2871ZM69.9352 48.0187V48.018C67.1245 48.0053 64.4238 49.1126 62.4298 51.0939C60.4357 53.076 59.3132 55.77 59.3084 58.5814C59.3044 61.3922 60.4196 64.0896 62.407 66.0776C64.3951 68.0657 67.0923 69.1802 69.9039 69.1763C72.7147 69.1716 75.4086 68.049 77.3907 66.0549C79.3721 64.0615 80.4793 61.3609 80.4666 58.5495C80.4513 55.7613 79.3374 53.0914 77.3653 51.1194C75.3939 49.1481 72.7241 48.0334 69.9352 48.018V48.0187ZM30.3189 48.018C27.5141 48.018 24.8241 49.1319 22.8408 51.1146C20.8568 53.0974 19.7415 55.7859 19.7401 58.5907C19.7381 61.3954 20.85 64.0861 22.8314 66.0708C24.8127 68.0555 27.5013 69.1729 30.3062 69.1761C33.1103 69.1794 35.8017 68.0689 37.7877 66.0888C39.7744 64.1087 40.8923 61.4207 40.8976 58.616C40.8849 55.8273 39.7717 53.1559 37.799 51.1832C35.827 49.2112 33.1558 48.0979 30.3662 48.0852L30.3189 48.018ZM50.1274 12.5001C54.2083 12.4874 58.1264 14.0981 61.018 16.9777C63.9096 19.8572 65.5371 23.7687 65.541 27.8496C65.5451 31.9306 63.9263 35.8454 61.0407 38.7308C58.1551 41.6165 54.2398 43.236 50.1595 43.2312C46.0786 43.2272 42.1672 41.5997 39.2875 38.7081C36.4079 35.8165 34.7965 31.8985 34.8093 27.8175C34.8093 23.7552 36.4234 19.8592 39.2963 16.9864C42.1686 14.1141 46.0652 12.5001 50.1274 12.5001V12.5001ZM69.9347 43.2317V43.231C74.0157 43.2183 77.9337 44.8298 80.8253 47.7093C83.7169 50.5889 85.3444 54.5003 85.3484 58.5813C85.3524 62.6616 83.7336 66.577 80.848 69.4625C77.9624 72.3481 74.0478 73.9669 69.9668 73.9628C65.8859 73.9588 61.9745 72.3313 59.0949 69.4397C56.2152 66.5481 54.6045 62.6301 54.6173 58.5491C54.6173 54.4868 56.2307 50.5901 59.1036 47.718C61.9759 44.845 65.8725 43.231 69.9347 43.231V43.2317ZM30.3183 43.2317V43.231C34.3986 43.2183 38.3174 44.8298 41.209 47.7093C44.1006 50.5889 45.7274 54.5003 45.732 58.5813C45.736 62.6616 44.1166 66.577 41.231 69.4625C38.3454 72.3479 34.4308 73.9669 30.3503 73.9628C26.2694 73.9588 22.358 72.3313 19.4783 69.4397C16.5987 66.5481 14.9873 62.6301 15.0001 58.5491C15.0001 54.4868 16.6142 50.5901 19.4864 47.718C22.3594 44.845 26.2553 43.231 30.3182 43.231L30.3183 43.2317Z" />
            </svg>,
            'spades': <svg
                key={2}
                className="icon spades"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M65.5807 87.5H34.5811L50.0812 71.9999L65.5807 87.5ZM50.0805 19.3493L31.4219 37.9975L22.4805 46.939C20.466 48.9628 19.3349 51.7022 19.3349 54.5579C19.3349 57.4136 20.4661 60.1531 22.4805 62.1769C24.5017 64.1932 27.2398 65.3251 30.0948 65.3251C32.9498 65.3251 35.6878 64.1932 37.709 62.1769L50.0798 49.8061L62.4506 62.1769C64.4718 64.1932 67.2099 65.3251 70.0649 65.3251C72.9199 65.3251 75.6579 64.1932 77.6791 62.1769C79.6936 60.1531 80.8248 57.4136 80.8248 54.5579C80.8248 51.7022 79.6936 48.9628 77.6791 46.939L68.7377 37.9975L50.0791 19.3493H50.0805ZM50.0791 12.5L72.1559 34.5768L81.0777 43.5183C84.009 46.4442 85.6565 50.4155 85.6565 54.557C85.6565 58.6986 84.0091 62.6699 81.0777 65.5958C78.1511 68.5245 74.1797 70.1698 70.0389 70.1698C65.8986 70.1698 61.9273 68.5244 59.0002 65.5958L50.0784 56.6544L41.137 65.5958C38.2104 68.5185 34.2437 70.1605 30.1076 70.1605C25.9721 70.1605 22.0048 68.5184 19.0788 65.5958C16.1475 62.6699 14.5 58.6986 14.5 54.557C14.5 50.4155 16.1474 46.4442 19.0788 43.5183L28.0203 34.5768L50.0791 12.5Z" />
            </svg>,
            'hearts': <svg
                key={3}
                className="icon hearts"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M71.0561 23.8175C74.2696 23.8157 77.3525 25.0888 79.6288 27.3573C81.9045 29.6264 83.1873 32.7052 83.1957 35.9187C83.2041 39.1327 81.9376 42.2181 79.6733 44.4986L70.2116 53.9519L50.0044 74.1684L29.7971 53.9519L20.3696 44.5329C17.4303 41.4421 16.3285 37.0361 17.467 32.9253C18.6049 28.8144 21.8172 25.6028 25.9272 24.4644C30.0381 23.326 34.4447 24.4284 37.5355 27.3677L46.9539 36.7951L50.0044 39.8367L53.0549 36.7945L62.4733 27.3677C64.7544 25.0775 67.8584 23.7991 71.0904 23.8177L71.0561 23.8175ZM71.0904 19.5091C66.726 19.4995 62.5382 21.2336 59.4576 24.3256L50.0042 33.7447L40.5858 24.3256C37.5016 21.2379 33.3169 19.5031 28.9523 19.5031C24.5885 19.5031 20.403 21.2378 17.3195 24.3256C14.2334 27.411 12.5 31.5958 12.5 35.9591C12.5 40.3223 14.2336 44.5072 17.3195 47.5926L26.7379 57.0026L50.0042 80.2689L73.2706 57.0026L82.6805 47.5835C85.7666 44.4987 87.5 40.314 87.5 35.9507C87.5 31.5868 85.7664 27.4026 82.6805 24.3172C79.6024 21.227 75.4177 19.4934 71.0561 19.5L71.0904 19.5091Z" />
            </svg>,
            'diamonds': <svg
                key={4}
                className="icon diamonds"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M50 19.3832L80.6175 50.0007L50 80.6182L19.3825 50.0007L50 19.3832ZM50 12.5L12.5 50L50 87.5L87.5 50L50 12.5V12.5Z" />
            </svg>
        },
        'theme-2': {
            'clubs': <svg
                key={1}
                className="icon clubs theme-2"
                viewBox="0 0 100 100"
                fill='none'
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M36.4506 37.3147V15H63.7595V37.3147V39.8147H66.2595H79.7109V64.8563H20.5V39.8147H33.9506H36.4506V37.3147ZM59.2393 85H40.9736L50.1065 75.8677L59.2393 85Z" strokeWidth="5" />
            </svg>,
            'spades': <svg
                key={2}
                className="icon spades theme-2"
                viewBox="0 0 100 100"
                fill='none'
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M67.9206 37.9552L83.9635 53.9975L67.8212 70.1232L51.7662 54.0961L50 52.333L48.2338 54.0961L32.1788 70.1232L16.0366 53.9976L32.0812 37.9553L32.0813 37.9552L50.0009 20.0355L67.9206 37.9552L67.9206 37.9552ZM50 73.0714L57.7767 80.8711H42.2233L50 73.0714Z" strokeWidth="5" />
            </svg>,
            'hearts': <svg
                key={3}
                className="icon hearts theme-2"
                viewBox="0 0 100 100"
                fill='none'
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M48.2335 41.0778L50.0009 42.8442L51.7682 41.0777L67.8177 25.0351L83.965 41.1825L67.9247 57.2326L67.9237 57.2335L50.0008 75.148L32.0778 57.2335L32.0769 57.2326L16.0351 41.1824L32.1824 25.0351L48.2335 41.0778Z" strokeWidth="5" />
            </svg>,
            'diamonds': <svg
                key={4}
                className="icon diamonds theme-2"
                viewBox="0 0 100 100"
                fill='none'
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M50 16.0355L83.9645 50L50 83.9645L16.0355 50L50 16.0355Z" strokeWidth="5" />
            </svg>
        },
        'theme-3': {
            'clubs': <svg
                key={1}
                className="icon clubs"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M34.9043 73.4134C39.6357 73.4107 44.1609 71.481 47.4389 68.0694V69.052C47.4389 69.1205 47.3409 75.2896 43.2933 79.3371C41.2301 81.4003 36.2795 82.5884 35.0811 82.5884V87.5C37.0455 87.5 43.4797 86.1049 46.7709 82.8145C52.2917 77.2937 52.3601 69.4056 52.3601 69.0624V68.0797C55.863 71.7059 60.7642 73.6383 65.7991 73.3785C70.8341 73.1187 75.5099 70.6925 78.6216 66.7257C81.7324 62.7584 82.9747 57.6384 82.0264 52.6871C81.0781 47.7352 78.0336 43.4361 73.6763 40.8987L71.191 45.1127C74.382 46.9758 76.5871 50.1531 77.2169 53.7943C77.8459 57.4349 76.8359 61.1679 74.4562 63.9943C72.0765 66.8208 68.5702 68.4523 64.8749 68.4523C61.1803 68.4523 57.6739 66.8208 55.2943 63.9943C52.9146 61.1679 51.9046 57.4347 52.5336 53.7943C53.1633 50.1531 55.3683 46.9758 58.5587 45.1127C63.0469 42.5487 66.168 38.127 67.0814 33.0393C67.9941 27.9516 66.6052 22.7207 63.2888 18.756C59.9724 14.7913 55.069 12.5 49.8997 12.5C44.7304 12.5 39.8278 14.7913 36.5107 18.756C33.1943 22.7207 31.8054 27.9516 32.7188 33.0393C33.6315 38.127 36.7526 42.5487 41.2408 45.1127C45.0697 47.3677 47.4262 51.475 47.4392 55.9186C47.457 57.1506 47.2912 58.3791 46.9479 59.5625L27.8312 39.9161L26.171 40.8987H26.1716C21.7205 43.4888 18.6411 47.9124 17.7586 52.9865C16.8753 58.0598 18.2794 63.264 21.5937 67.2054C24.9074 71.1468 29.7936 73.4223 34.9436 73.423L34.9043 73.4134ZM56.0926 40.8986C53.5354 42.3985 51.4023 44.5247 49.8941 47.0772C48.386 44.5247 46.2529 42.3985 43.6957 40.8986C40.4731 39.0574 38.2319 35.8821 37.576 32.2285C36.9209 28.5757 37.9179 24.8194 40.2997 21.9722C42.6814 19.1258 46.202 17.4807 49.9139 17.4807C53.6257 17.4807 57.1463 19.1259 59.5275 21.9722C61.9093 24.8192 62.9071 28.5757 62.2512 32.2285C61.5955 35.8821 59.3548 39.0574 56.1315 40.8986H56.0926ZM27.0443 46.2027L44.4514 64.0705C42.1641 66.7462 38.8565 68.3352 35.3388 68.449C31.8201 68.5634 28.4167 67.1923 25.9609 64.6707C23.5051 62.1499 22.223 58.7114 22.4293 55.1977C22.6355 51.6839 24.3103 48.4188 27.0443 46.2022V46.2027Z" />
            </svg>,
            'spades': <svg
                key={2}
                className="icon spades"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M71.082 39.1632L43.9322 66.313C43.885 66.313 39.6514 70.4629 34.178 70.4629C28.0198 70.4629 23.194 65.2711 23.194 58.6434C23.194 52.0156 26.2168 48.8421 26.3295 48.7294L42.9086 32.1595C52.4092 22.7715 52.5219 12.9141 52.5219 12.5H47.8279C47.8279 12.5753 47.7342 20.7898 39.6041 28.8256L23.0061 45.4144C22.828 45.5926 18.5 50.0332 18.5 58.6419C18.5 67.8983 25.391 75.1554 34.178 75.1554C41.6323 75.1554 47.0113 69.8701 47.2463 69.6349L47.8285 69.0527V69.8792C47.8285 70.1981 47.894 77.7467 53.1701 83.0221C56.3155 86.1765 62.4266 87.5 64.3421 87.5V82.806C63.1967 82.806 58.4653 81.6796 56.4937 79.7079C52.6156 75.822 52.522 69.9263 52.522 69.8798V69.0534L53.1133 69.6447C53.3386 69.87 58.7465 75.1553 66.1719 75.1553C74.9588 75.1553 81.85 67.8982 81.85 58.6418C81.85 50.033 77.5221 45.5924 77.334 45.4144L71.082 39.1632ZM66.1346 70.4622C60.6613 70.4622 56.4277 66.3504 56.3896 66.3223L53.4604 63.384L71.0814 45.7999L74.0007 48.71C74.1323 48.8416 77.1551 52.0805 77.1551 58.6422C77.1558 65.2046 72.3302 70.4617 66.1339 70.4617L66.1346 70.4622Z" />
            </svg>,
            'hearts': <svg
                key={3}
                className="icon hearts"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M68.8947 13.0002C60.0696 13.0002 53.7013 19.2692 53.4346 19.5242L57.391 23.4262C57.4468 23.4262 62.459 18.5132 68.9389 18.5132C76.2297 18.5132 81.9429 24.6597 81.9429 32.5064C81.9437 40.353 78.3643 44.1544 78.2309 44.2876L74.7522 47.7555L46.5213 19.5246C46.2546 19.2688 39.8522 13.0006 31.0613 13.0006C20.6585 13.0006 12.5 21.5923 12.5 32.551C12.5 42.7431 17.6238 48.0002 17.8465 48.2227L37.4962 67.8839C47.0106 77.2757 47.2214 86.7784 47.2214 87.2119H52.7786C52.7786 86.8118 52.9895 77.2759 62.5147 67.8724L82.1652 48.2112C82.3761 48.0003 87.5 42.7431 87.5 32.5512C87.5008 21.5917 79.3423 13 68.8947 13V13.0002ZM58.5586 63.9166V63.9174C54.9527 67.4195 52.0346 71.5664 49.9559 76.143C47.8821 71.5664 44.9677 67.4195 41.3642 63.9174L21.7913 44.3112C21.6355 44.1553 18.0569 40.3209 18.0569 32.5524C18.0569 24.7832 23.7699 18.5584 31.1057 18.5584C37.5406 18.5584 42.5537 23.4272 42.5977 23.4272L70.8286 51.6581L58.5586 63.9166Z" />
            </svg>,
            'diamonds': <svg
                key={4}
                className="icon diamonds"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M75.3861 47.7871H73.1552C71.0582 47.7871 62.8563 45.8501 59.3013 42.2952C52.5386 35.5326 52.4147 25.3588 52.4147 25.2605V12.5H47.9715V25.2517C47.9715 25.7402 48.0781 37.3371 56.1649 45.4237C58.363 47.4414 60.9433 48.9977 63.7538 50.0001C61.0239 50.9919 58.5104 52.5007 56.3515 54.4433L42.6575 40.7139L41.0849 42.2865C37.5307 45.8407 29.328 47.7784 27.2309 47.7784H25V52.2216H27.2303C29.3273 52.2216 37.5292 54.1587 41.0843 57.7135C47.8469 64.4762 47.9708 74.6499 47.9708 74.7483L47.9715 87.5H52.4146V74.7569C52.4146 74.6502 52.5392 64.4752 59.3012 57.7126C62.8554 54.1583 71.0581 52.2206 73.1552 52.2206H75.3855V47.7775L75.3861 47.7871ZM44.2221 54.5764C42.024 52.5588 39.4436 51.0024 36.6332 50C38.7283 49.219 40.7119 48.1677 42.5337 46.8722L53.455 57.7935C52.1211 59.6958 51.0257 61.755 50.1939 63.9252C48.8785 60.4254 46.8442 57.2406 44.2221 54.5764V54.5764Z" />
            </svg>
        }
    },
    modalClasses = [
        'icon-theme-modal',
        'score-modal',
        'history-modal',
        'help-modal',
        'sign-up-modal',
        'place-bet-modal'
    ],
    defaultContext: MainContextInterface = {
        user: {
            uid: '',
            name: '',
            email: '',
            token: '',
            isLoggedIn: false
        },
        activeModal: "",
        balance: 0,
        activeIconTheme: iconThemes['theme-3'],
        bet: 0,
        previousBets: [],
        isLoading: true,
        darkTheme: false,
        authing: false,
        error: '',
        restart: false
    },
    /**Initializing the firebase app */
    defaultBalance = 3000,
    FirebaseApp = initializeApp(config.firebase),
    auth = getAuth(FirebaseApp),
    selectedIconTheme = localStorage.getItem('icon-theme'),
    selectedColorTheme = localStorage.getItem('theme') === 'true' ? true : false,
    MainContext = createContext<MainContextInterface>(defaultContext),

    authenticate = async (user: AuthUserInterface, callback: (error: string | null, user: DBUserInterface | null) => void) => {
        const { uid, name } = user,
            balance = defaultBalance,
            month = 0,
            week = 0,
            all_time = 0

        await axios({
            method: 'POST',
            url: `${config.server}/player/auth`,
            data: { uid, name, balance, week, month, all_time },
            headers: { Authorization: user.token }
        }).then(response => {
            if (response.status !== (200 || 201 || 304)) callback('Unable to authenticate user!', null)
            else {
                logger.info('User succefully authenticated')
                callback(null, response.data.user)
            }
        }).catch(error => callback(`Unable to authenticate user!, ${error.message}`, null))
    },

    getUserData = async (uid: string, callback: (error: string | null, user: DBUserInterface | null) => void) => {
        await axios({
            method: 'GET',
            url: `${config.server}/player/one/${uid}`
        }).then(response => {
            if (response.status !== (200 || 304)) callback('Unable to retrive user!', null)
            else {
                logger.info('User data succefully retrived')
                callback(null, response.data.user)
            }
        }).catch(error => callback(`Unable to retrive user data, ${error.message}`, null))
    },

    getAllUserScores = async (callback: (error: string | null, user: DBUserInterface[] | null) => void) => {
        await axios({
            method: 'GET',
            url: `${config.server}/player/all`
        }).then(response => {
            if (response.status !== (200 || 304)) callback('Unable to retrive users!', null)
            else {
                logger.info('Users succefully retrived')
                callback(null, response.data.users)
            }
        }).catch(error => callback(`Unable to retrive user data, ${error.message}`, null))
    },

    updateUserData = async (uid: string, balance: number, callback: (error: string | null, user: DBUserInterface | null) => void) => {
        await axios({
            method: 'PATCH',
            url: `${config.server}/player/update/${uid}`,
            data: { balance }
        }).then(response => {
            if (response.status !== 201) callback(`Unable to update user data!, ${response.status}`, null)
            else {
                logger.info('User data succefully updated')
                callback(null, response.data.user)
            }
        }).catch(error => callback(`Unable to update user data!, ${error.message}`, null))
    }

const MainProvider: FunctionComponent = ({ children }) => {
    const // Estados // A sea of re-renders
        [activeIconTheme, setActiveIconTheme] = useState(defaultContext.activeIconTheme),
        [previousBets, setPreviousBets] = useState(defaultContext.previousBets),
        [activeModal, setActiveModal] = useState(defaultContext.activeModal),
        [darkTheme, toggleDarkTheme] = useState(defaultContext.darkTheme),
        [isLoading, setLoading] = useState(defaultContext.isLoading),
        [authing, toggleAuthing] = useState(defaultContext.authing),
        [restart, toggleRestart] = useState(defaultContext.restart), //Alternative would've been reloading the page
        [balance, setBalance] = useState(defaultContext.balance),
        [error, setError] = useState(defaultContext.error),
        [user, setUser] = useState(defaultContext.user),
        [bet, setBet] = useState(defaultContext.bet),
        auth = getAuth(FirebaseApp),

        guestSignIn = async () => {
            toggleAuthing!(true)
            await signInAnonymously(auth)
                .then(res => logger.info('Successfully logged in as Guest ' + res.user.providerData))
                .catch(error => { logger.error(error); setError!(error) })
                .finally(() => toggleAuthing!(false))
        },

        contextValues = {
            activeIconTheme, setActiveIconTheme,
            previousBets, setPreviousBets,
            activeModal, setActiveModal,
            darkTheme, toggleDarkTheme,
            authing, toggleAuthing,
            isLoading, setLoading,
            restart, toggleRestart,
            balance, setBalance,
            error, setError,
            user, setUser,
            bet, setBet,
        }

    useEffect(() => {
        if (selectedColorTheme) toggleDarkTheme(true)
        if (selectedIconTheme && ['theme-1', 'theme-2', 'theme-3'].includes(selectedIconTheme)) setActiveIconTheme(iconThemes[selectedIconTheme])
    }, [])

    useEffect(() => {
        const authCheck = onAuthStateChanged(auth, async (authUser) => {
            toggleAuthing(true)
            if (authUser)
                setUser({
                    uid: authUser.uid,
                    name: authUser.isAnonymous ? 'Guest' : authUser.displayName ? authUser.displayName : defaultContext.user.name,
                    email: authUser.email ? authUser.email : defaultContext.user.email,
                    token: await authUser.getIdToken(),
                    isLoggedIn: true
                })
            else guestSignIn()
        }, (err) => logger.error(err.message))

        return () => authCheck()
        // eslint-disable-next-line
    }, [auth])

    useEffect(() => {
        if (authing && user.name !== ('' || 'Guest'))
            authenticate(user, (error, user) => {
                if (error) logger.error(error)
                if (user) logger.info(`AUTHENTICATED :: NAME - ${user.name}, ID - ${user.uid}.`)
            }).then(() => getUserData(user.uid, (error, user) => {
                if (error) logger.error(error)
                if (user) {
                    logger.info(`RETRIVED :: NAME - ${user.name}, ID - ${user.uid}, BALANCE - ${user.balance}.`)
                    setBalance(user.balance)
                }
            })).finally(() => {
                logger.info(`Successfully signed in. NAME - ${user.name}, ID - ${user.uid}.`)
                toggleAuthing(false)
                setLoading(false)
            })

        if (user.name === 'Guest') {
            logger.info(`Successfully signed in as Guest, ID - ${user.uid}.`);
            localStorage.setItem('uid', user.uid)
            localStorage.getItem('balance') ? setBalance(parseInt(localStorage.getItem('balance')!)) : setBalance(defaultBalance)
            toggleAuthing(false); setLoading(false)
        }
        // eslint-disable-next-line
    }, [user])

    useEffect(() => {
        darkTheme ? document.documentElement.setAttribute('data-theme', 'dark') : document.documentElement.setAttribute('data-theme', 'light')
        localStorage.setItem('theme', `${darkTheme}`)
        // eslint-disable-next-line
    }, [darkTheme])

    useEffect(() => {
        setActiveModal('')
        if (previousBets.length > 4) previousBets.pop()
        // eslint-disable-next-line
    }, [activeIconTheme, bet])

    useEffect(() => { if (error !== '') setError('') }, [activeModal])

    return ( // FOr some reason, i cant wrap these FCs with the MainProvider in the index. Only works this way
        <>
            {authing && <AuthLoader />}
            {isLoading
                ? <LoadingScreen />
                : <MainContext.Provider value={contextValues}>
                    <Navbar />
                    {activeModal !== '' && <Modal />}
                    <Main />
                </MainContext.Provider>}
        </>

    )
}

export const useMainContext = () => useContext(MainContext)
export default MainProvider