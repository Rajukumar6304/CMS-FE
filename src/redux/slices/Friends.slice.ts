import { AcceptRejectRequest, GetFriendRequests, GetOrganizationUsers, GetSentRequests, GetUserData, RemoveFriend, SearchForUsers, SendRequest, UnsendRequest } from "@redux/actions/Friend.actions";
import { createSlice } from "@reduxjs/toolkit";

interface initialState {
    isFriendLoading: boolean;
    isUserDataLoading: boolean;
    isRemoveFriendLoading: boolean;
    isRequestsLoading: boolean;
    isSearchLoading: boolean;
    isSendRequestLoading: boolean;
    isAcptRejtLoading: boolean;
    isSentRequestsLoading: boolean;
    isOrgUsersLoading: boolean;
    error: boolean
    searchedUsersList: [];
    searchedUsersCount: number | null
    showFriendsMenu: boolean
    sentRequests: []
    friendRequests: []
    userData: {};
    orgUsers: []
}

const initialState: initialState = {
    isFriendLoading: false,
    isUserDataLoading: false,
    isRemoveFriendLoading: false,
    isRequestsLoading: false,
    isSearchLoading: false,
    isSendRequestLoading: false,
    isAcptRejtLoading: false,
    isSentRequestsLoading: false,
    isOrgUsersLoading: false,

    error: false,

    searchedUsersList: [],
    searchedUsersCount: null,

    showFriendsMenu: false,

    sentRequests: [],

    friendRequests: [],

    userData: {},
    orgUsers: []
};

const Friendslice = createSlice({
    name: "contact",
    initialState,
    reducers: {
        // toggle friends menu
        setShowFriendsMenu(state, action) {
            state.showFriendsMenu = !state.showFriendsMenu;
        },

        // update user information
        clearSearchUsers: (state, action) => {
            state.searchedUsersList = [];
            state.searchedUsersCount = null;
        },
    }, 
    extraReducers(builder) {
        builder
            // --------- User Data Builder ---------
            .addCase(GetUserData.pending, handlePending("isUserDataLoading"))
            .addCase(GetUserData.fulfilled, (state, action) => {
                state.userData = action.payload.userData;
                state.isUserDataLoading = false;
                state.error = false;
            })
            .addCase(GetUserData.rejected, handleRejected("isUserDataLoading"))

            // --------- Remove Frined Builder ---------
            .addCase(RemoveFriend.pending, handlePending("isRemoveFriendLoading"))
            .addCase(RemoveFriend.fulfilled, (state, action) => {
                state.isRemoveFriendLoading = false;
                state.error = false;
            })
            .addCase(RemoveFriend.rejected, handleRejected("isRemoveFriendLoading"))

            // --------- Frined Requests Builder ---------
            .addCase(GetFriendRequests.pending, handlePending("isRequestsLoading"))
            .addCase(GetFriendRequests.fulfilled, (state, action) => {
                // console.log(" action:", action)
                state.friendRequests = action.payload.data.friendRequests;
                state.isRequestsLoading = false;
                state.error = false;
            })
            .addCase(GetFriendRequests.rejected, handleRejected("isRequestsLoading"))

            // --------- Search Users Builder ---------
            .addCase(SearchForUsers.pending, handlePending("isSearchLoading"))
            .addCase(SearchForUsers.fulfilled, (state, action) => {
                if (action.payload.usersFound === 0) {
                    state.searchedUsersList = null;
                    state.searchedUsersCount = null;
                } else {
                    state.searchedUsersList = action.payload.users;
                    state.searchedUsersCount = action.payload.usersFound;
                }

                state.sentRequests = [];
                state.isSendRequestLoading = false;
                state.isSearchLoading = false;
                state.error = false;
            })
            .addCase(SearchForUsers.rejected, handleRejected("isSearchLoading"))

            // --------- Send Request Builder ---------
            .addCase(SendRequest.pending, handlePending("isSendRequestLoading"))
            .addCase(SendRequest.fulfilled, (state, action) => {
                const receiverId = action.payload.receiver._id;
                const index = state.sentRequests.findIndex(
                    (request) => request.receiverId === receiverId
                );

                if (index !== -1) {
                    state.sentRequests[index].isSent = true;
                } else {
                    state.sentRequests.push({ receiverId, isSent: true });
                }
                state.isSendRequestLoading = false;
                state.error = false;
            })

            .addCase(SendRequest.rejected, handleRejected("isSendRequestLoading"))

            // --------- Unsend Request Builder ---------
            .addCase(UnsendRequest.pending, handlePending("isSendRequestLoading"))
            .addCase(UnsendRequest.fulfilled, (state, action) => {
                const receiverId = action.payload.receiver_id;
                const index = state.sentRequests.findIndex(
                    (request) => request.receiverId === receiverId
                );

                if (index !== -1) {
                    state.sentRequests[index].isSent = false;
                } else {
                    state.sentRequests.push({ receiverId, isSent: false });
                }
                state.isSendRequestLoading = false;
                state.error = false;
            })

            .addCase(UnsendRequest.rejected, handleRejected("isSendRequestLoading"))

            // --------- Accept/Reject Request Builder ---------
            .addCase(AcceptRejectRequest.pending, handlePending("isAcptRejtLoading"))
            .addCase(AcceptRejectRequest.fulfilled, (state, action) => {
                const sender_id = action.payload.sender_id;
                state.friendRequests = state.friendRequests.filter(
                    (request) => request?.sender?._id !== sender_id
                );
                state.isAcptRejtLoading = false;
                state.error = false;
            })

            .addCase(
                AcceptRejectRequest.rejected,
                handleRejected("isAcptRejtLoading")
            )

            // --------- Get Sent Request Builder ---------
            .addCase(GetSentRequests.pending, handlePending("isSentRequestsLoading"))
            .addCase(GetSentRequests.fulfilled, (state, action) => {
                state.sentRequests = action.payload.sentRequests;
                state.isSentRequestsLoading = false;
                state.error = false;
            })

            .addCase(
                GetSentRequests.rejected,
                handleRejected("isSentRequestsLoading")
            )
            // --------- Get Org Users Builder ---------
            .addCase(GetOrganizationUsers.pending, handlePending("isOrgUsersLoading"))
            .addCase(GetOrganizationUsers.fulfilled, (state, action) => {
                state.orgUsers =  action.payload.data;
                state.isOrgUsersLoading = false;
                state.error = false;
            })

            .addCase(
                GetOrganizationUsers.rejected,
                handleRejected("isOrgUsersLoading")
            );
    }
})

// function for pending and rejected handling
function handlePending(actionName) {
    return (state, action) => {
        state[actionName] = true;
        state.error = false;
    };
}

function handleRejected(actionName) {
    return (state, action) => {
        state[actionName] = false;
        state.error = true;
    };
}

export const { setShowFriendsMenu, clearSearchUsers, clearOrgUsers } = Friendslice.actions;


export default Friendslice.reducer;
