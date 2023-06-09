import { useState, useEffect, React } from 'react'
import styled from 'styled-components';
import { ethers } from 'ethers';
import axios from "axios";
import { poolAbi } from "../../config";
import web3modal from "web3modal"
import ClipLoader from "react-spinners/ClipLoader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function RequestCard(props) {

    const [userMetaData, setUserMetaData] = useState({
        name: "",
        profileURI: ""
    });
    const [isApproving, setIsApproving] = useState(false);
    const [isdecling, setIsdecling] = useState(false);
    const [claimStatus, setClaimStatus] = useState(false);


    const approve = async () => {
        setIsApproving(true);
        const modal = new web3modal({
            cacheProvider: true,
        });

        const connection = await modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        try {
            const poolContract = new ethers.Contract(
                props.poolAddress,
                poolAbi.abi,
                signer
            )

            const transaction = await poolContract.approveClaim(
                props.userAddress,
            )

            await transaction.wait()
                .then(() => {
                    toast.success("Claim approved.", {
                        position: toast.POSITION.TOP_CENTER
                    });
                    setIsApproving(false);
                }).catch((error) => {
                    setIsApproving(false);
                    toast.error("Error: Transaction failed!", {
                        position: toast.POSITION.TOP_CENTER
                    });
                    console.error(error);
                })

        } catch (error) {
            console.log(error);
            setIsApproving(false);
            toast.error("Revert: Already approved!", {
                position: toast.POSITION.TOP_CENTER
            });
        }
    }

    const decline = async () => {
        setIsdecling(true);
        const modal = new web3modal({
            cacheProvider: true,
        });

        const connection = await modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        try {
            const poolContract = new ethers.Contract(
                props.poolAddress,
                poolAbi.abi,
                signer
            )

            const transaction = await poolContract.declineClaim(
                props.userAddress,
            )

            await transaction.wait()
                .then(() => {
                    toast.success("Claim declined.", {
                        position: toast.POSITION.TOP_CENTER
                    });
                    setIsdecling(false);
                }).catch((error) => {
                    setIsdecling(false);
                    toast.error("Error: Transaction failed!", {
                        position: toast.POSITION.TOP_CENTER
                    });
                    console.error(error);
                })

        } catch (error) {
            console.log(error);
            setIsdecling(false);
            toast.error("Transaction failed!", {
                position: toast.POSITION.TOP_CENTER
            });
        }
    }

    /*--------------------get claim status of requests---------------------------*/
    const getClaimStatus = async () => {
        const provider = new ethers.providers.JsonRpcProvider('https://endpoints.omniatech.io/v1/fantom/testnet/public');
        const pinsuranceContract = new ethers.Contract(
            props.poolAddress,
            poolAbi.abi,
            provider
        )
        try {
            const status = await pinsuranceContract.getClaimStatus(props.userAddress);
            setClaimStatus(status);
        } catch (error) {
            console.log(error);
            setIsFetching(false);
        }
    }
    /*--------------------------------------------------------------------------------*/

    useEffect(() => {
        fetchUserMetaData()
        getClaimStatus();
    }, [props.userAddress]);

    const fetchUserMetaData = async () => {
        const uriResponse = await axios.get(props.userMetaURI);
        setUserMetaData({
            ...userMetaData,
            name: uriResponse.data.name,
            profileURI: uriResponse.data.profileURI
        })
    }

    return (
        <Container>
            <div className='left'>
                <div className='profile-image'>
                    <img src={userMetaData.profileURI} />
                </div>
            </div>
            <div className='right'>
                <div className='detail-container'>
                    <div className='name-div'>
                        <p>{userMetaData.name}</p>
                        <div className='stake-div'>
                            <div className='staked'>
                                <p>{props.userAddress}</p>
                            </div>
                        </div>
                    </div>
                    <div className='pool-div'>
                        <div className='pool-label'>
                            <p>Pool</p>
                        </div>
                        <div className='pool-name'>
                            <p>{props.poolName}</p>
                        </div>
                        <div className='pool-address'>
                            <p>{props.poolAddress}</p>
                        </div>
                    </div>
                    <div className='meta-div'>
                        <div className='premium-div'>
                            <div className='logo-div'>
                                <img src='/images/usdc-logo.svg' />
                            </div>
                            <div className='email'>
                                <p>{props.claimAmount}</p>
                            </div>
                        </div>
                        <a href={props.docURI} target="_blank" className='doc-div'>
                            <p>Show support document</p>
                            <div className='logo-div'>
                                <img src="images/link.png" />
                            </div>
                        </a>
                        {claimStatus &&
                            <div className='status-div'>
                                <p>Request approved by majority</p>
                            </div>
                        }
                        {!claimStatus &&
                            <div className='buttons-div'>
                                <div className='approve-div' onClick={approve}>
                                    {!isApproving &&
                                        <p>Approve</p>
                                    }
                                    {isApproving &&
                                        <ClipLoader color="#ffffff" size={13} />
                                    }
                                </div>
                                <div className='decline-div' onClick={decline}>
                                    {!isdecling &&
                                        <p>Decline</p>
                                    }
                                    {isdecling &&
                                        <ClipLoader color="#ffffff" size={13} />
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default RequestCard

const Container = styled.div`
    height: 9rem;
    width: 100%;
    margin-bottom: 2rem;
    background-color:white;
    border-radius: 8px;
    border: 1px solid #0152b546;
    overflow: hidden;
    color:white;
    display: flex;
    justify-content: center;
    align-items: center;

    .left {
        width: 9rem;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color:white;
        

        .profile-image {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 6.5rem;
            height: 6.5rem;
            border-radius: 3px;
            border: 1px solid #0152b546;
            overflow: hidden;
            background-color:white;

            
            img {
                width: 100%;
            }
        }
    }

    .right {
      flex: 1;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      .detail-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 7rem;
        gap: 7px;

        .pool-div {
            height: 1.8rem;
            width: 98.5%;
            display: flex;
            align-items: center;
            border: 1px solid white;
            background-color: white;
            border-radius: 3px;
            overflow: hidden;

            .pool-label {
                height: 100%;
                width: 3rem;
                /* border: 1px solid #0152b546; */
                /* border-right: 2px solid white; */
                display: flex;
                justify-content: center;
                align-items: center;
                background-color:  white;

                p {
                    margin: 0;
                }
            }

            .pool-name {
                height: 100%;
                width: 53.5rem;
                display: flex;
                justify-content: start;
                align-items: center;

                p {
                    margin: 0;
                    margin-left: 10px;
                }
            }

            .pool-address {
                flex: 1;
                height: 90%;
                display: flex;
                justify-content: start;
                align-items: center;
                background-color: white ;
                margin-right: 15px;
                border-radius: 3px;

                p {
                    margin: 0;
                    margin-left: 10px;
                    font-size: 15px;
                }
            }
        }

        .name-div {
            height: 2.5rem;
            width: 98.5%;
            display: flex;
            justify-content: start;
            align-items: center;
            border: 1px solid white;
            background-color:white;
            border-radius: 3px;


            p {
                flex:1;
                margin: 0;
                margin-left: 10px;
                font-size: 25px;
            }

            .stake-div {
                width: 26rem;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;

                .staked {
                    width: 24rem;
                    height: 1.5rem;
                    border: 1px solid #0152b546;
                    border-radius: 3px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    p {
                        margin: 0;
                        margin-left: 13px;
                        font-size: 15px;
                        
                    }
                }
            }
        }

        .meta-div {
            height: 1.8rem;
            width: 98.5%;
            display: flex;
            align-items: center;
            gap: 7px;

            .premium-div {
                /* margin-left: 10px; */
                flex:1;
                height: 100%;
                border-radius: 3px;
                display: flex;
                justify-content:start;
                align-items: center;
                overflow: hidden;
                background-color: #ffffff83;
                border: 1px solid white;

                .logo-div {
                    width: 3rem;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-right: 2px solid white;
                    background-color:  #0152b546;


                    img {
                        width: 40%;
                    }
                }

                .email {
                    display: flex;
                    justify-content: start;
                    align-items: center;
                    p {
                        margin: 0;
                        font-size: 15px;
                        margin-left: 8px;
                    }
                }
            }

            .doc-div {
                flex:1;
                height: 100%;
                border-radius: 4px;
                display: flex;
                justify-content:center;
                align-items: center;
                overflow: hidden;
                text-decoration: none;
                background-color: #0152b5cc;
                transition: opacity 0.15s;

                cursor: pointer;

                &:hover {
                    opacity: 0.9;
                }

                &:active {
                    opacity: 0.8;
                }


                p {
                    margin: 0;
                    color: white;
                    font-size: 15px;
                }

                .logo-div {
                    margin-left: 5px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 2.4rem;
                    width: 2.4rem;

                    img {
                        width: 50%;
                    }
                }
               
            }

            .buttons-div {
                flex:1;
                height: 100%;
                border-radius: 3px;
                display: flex;
                justify-content:center;
                align-items: center;
                gap: 1rem;
                overflow: hidden;
                background-color: #ffffff83;
                border: 1px solid white;

                .approve-div {
                    margin-left: 10px;
                    width: 11.5rem;
                    height: 89%;
                    border-radius: 3px;
                    background-color: green;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    transition: opacity 0.15s;

                    &:hover {
                        opacity: 0.9;
                    }

                    &:active {
                        opacity: 0.8;
                    }

                    p {
                        margin: 0;
                        color: white;
                        font-size: 15px;
                    }
                }

                .decline-div {
                    width: 11.5rem;
                    height: 89%;
                    border-radius: 3px;
                    background-color: #b40e0ee4;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    transition: opacity 0.15s;

                    &:hover {
                        opacity: 0.9;
                    }

                    &:active {
                        opacity: 0.8;
                    }
                    p {
                        margin: 0;
                        color: white;
                        font-size: 15px;
                    }
                }
            }

            .status-div {
                flex:1;
                height: 100%;
                border-radius: 3px;
                display: flex;
                justify-content:center;
                align-items: center;
                gap: 1rem;
                overflow: hidden;
                background-color: green;
                /* border: 1px solid white; */

                p {
                    margin: 0;
                    color: white;
                    font-size: 15px;
                }
            }
        }
      }
    }
`