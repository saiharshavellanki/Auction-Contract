# Open Auction

# Auction params
# Beneficiary receives money from the highest bidder
Payment: event({amount: uint256(wei), arg2: indexed(address)})
Winners: event({count: int128})

# beneficiary: public(address)
auction_start: public(timestamp)
auction_end: public(timestamp)

# Items
M_items: public(int128)

# Large prime no
q: public(int128)

bidder_registered: public(int128)

notary_registered: public(int128)

# Current state of auction
# highest_bidder: public(address)
# highest_bid: public(wei_value)

# Set to true at the end, disallows any change
# ended: public(bool)

bidder: public({
    n: int128,
    notary: address,
    bidder: address,
    isValid: bool,
    paid: decimal,
    payment: decimal
}[address])

winner_payments_calculated: bool
paid_bidders: bool

notary: public({
    bidder: address,
    notary: address,
    bid_input: int128[10][2],
    bid_value: int128[2],
    n: int128,
    isValid: bool,
    isAssigned: bool,
    fees: int128,
    count: int128
}[address])

bidder_map: address[int128]

security: public(uint256)

notary_map: public(address[int128])
notary_num: public(int128)
notary_fees_calculated: bool
winners: public(int128)
winner_bidder: public(address[int128])
winner_amount: public(decimal[int128])
c: public(int128)

# Create a simple auction with `_bidding_time`
# seconds bidding time on behalf of the
# beneficiary address `_beneficiary`.
@public
def __init__(bidding_time: timedelta, m: int128, Q: int128):
    self.M_items = m
    self.q = Q
    self.c = 2
    self.bidder_registered = 0
    self.notary_registered = 0
    self.notary_num = 0
    self.notary_fees_calculated = False
    self.winner_payments_calculated = False
    self.paid_bidders = False
    self.auction_start = block.timestamp
    self.auction_end = self.auction_start + bidding_time 
    self.security = 1



@public
def register_notaries():
    self.notary_map[self.notary_registered] = msg.sender
    self.notary[msg.sender].isValid = True
    self.notary_registered += 1

@public
def assignee(notary_idx: int128) -> int128:
    x: int128
    x = notary_idx + 1
    return x

@public
def sqrt(_val: decimal) -> decimal :
    z: decimal = (_val +1.0) / 2.0
    y: decimal = _val
    for i in range(100):
        if z < y:
            break
        y = z
        z = (_val/ z + z) / 2.0
    return y

@public
def assign_notary(sender: address, bid_items: int128[10][2], bid_amount: int128[2], num_items: int128):
    self.notary[self.notary_map[self.notary_num]].bidder = sender
    self.notary[self.notary_map[self.notary_num]].isAssigned = True
    self.bidder[sender].notary = self.notary_map[self.notary_num]
    self.bidder[sender].isValid = True
    self.notary_num = self.assignee(self.notary_num)

    self.bidder[sender].n = num_items
    
    self.notary[self.bidder[sender].notary].bid_value = bid_amount
    self.notary[self.bidder[sender].notary].bid_input = bid_items
    self.notary[self.bidder[sender].notary].n = num_items
    

@public
@payable
def register_bidders(bid_items: int128[10][2], bid_amount: int128[2], num_items: int128):
    assert msg.value == as_wei_value(self.security, 'wei')
    
    self.bidder_map[self.bidder_registered] = msg.sender
    self.bidder_registered += 1
    sender: address = msg.sender
    self.assign_notary(sender, bid_items, bid_amount, num_items)
    self.bidder[msg.sender].paid = convert(self.security, 'int128')
    self.bidder[msg.sender].payment = convert(self.security, 'int128')



@public
def get_value_notary(j: int128, k: int128, r: int128) -> int128:
    uj: int128 = self.notary[self.bidder[self.bidder_map[j]].notary].bid_value[0]
    uk: int128 = self.notary[self.bidder[self.bidder_map[k]].notary].bid_value[0]
    vj: int128 = self.notary[self.bidder[self.bidder_map[j]].notary].bid_value[1]
    vk: int128 = self.notary[self.bidder[self.bidder_map[k]].notary].bid_value[1]

    nj: int128 = self.notary[self.bidder[self.bidder_map[j]].notary].n
    nk: int128 = self.notary[self.bidder[self.bidder_map[k]].notary].n

    x: int128 = uj - uk 
    y: int128 = vj - vk 
    if r == 1:
        return x
    elif r == 2:
        return y   

@public
def which_greater(j: int128, k: int128) -> bool:
    val1: int128 = self.get_value_notary(j, k, 1)
    val2: int128 = self.get_value_notary(j, k, 2)

    Q: int128 = self.q

    if (val1 + val2) % Q < Q / 2:
        return True
    else:
        return False

@public
def check_equal(j: int128, k: int128) -> bool:
    val1: int128 = self.get_value_notary(j, k, 1)
    val2: int128 = self.get_value_notary(j, k, 2)

    Q: int128 = self.q

    if (val1 + val2) == 0:
        return True
    else:
        return False

# @public
# def swap_bidders(j: int128, k: int128):
#     temp: address = self.bidder_map[j]
#     self.bidder_map[j] = self.bidder_map[k]
#     self.bidder_map[k] = temp



##### Quick Sort
# @public
# def partition(low: int128, high: int128) -> int128:
#     i: int128 = low      # index of smaller element
#     pivot: int128 = high    # pivot
 
#     for j in range(100):
#         if j >= low and j < high:
#             # If current element is smaller than or
#             # equal to pivot
#             if self.which_greater(j, pivot):
             
#                 # increment index of smaller element
#                 i = i + 1
#                 self.swap_bidders(i,j)
 
#     self.swap_bidders(i + 1, high)
#     return (i + 1) 

# @public
# def quickSort(low: int128, high: int128):
#     if low < high:
 
#         # pi is partitioning index, arr[p] is now
#         # at right place
#         pi: int128 = self.partition(low,high)
 
#         # Separately sort elements before
#         # partition and after partition
#         self.quickSort(low, pi - 1)
#         self.quickSort(pi + 1, high)

##### Insertion Sort
@public
def move_bidders(j: int128, i: int128):
    temp: address = self.bidder_map[i]
    for k in range(1,100):
        if k > i - j:
            break
        self.bidder_map[j + k] = self.bidder_map[j]
    self.bidder_map[j] =  temp

@public
def insertionSort():
    l: int128 = self.bidder_registered
    idx: int128
    for i in range(1,100):
        if i == l:
            break
        j: int128 = i - 1
        for k in range(100):
            if self.which_greater(i, j):
                j = j - 1
            else:
                idx = j + 1
                self.move_bidders(idx, i)
                break

            if j < 0:
                idx = j + 1
                self.move_bidders(idx, i) 
                break


@public
def get_winners():
    self.insertionSort()
    
    # self.quickSort(0,self.bidder_registered-1)

    for i in range(0,10):
        if i == self.bidder_registered:
            break
        
        flag: int128 = 0
        
        for j in range(0,10):
            if j == self.winners:
                break

            for k in range(10):
                if k == self.notary[self.bidder[self.bidder_map[i]].notary].n:
                    break
                for l in range(0,10):
                    if l == self.notary[self.bidder[self.winner_bidder[j]].notary].n:
                        break
                    if (self.notary[self.bidder[self.bidder_map[i]].notary].bid_input[k][0] + self.notary[self.bidder[self.bidder_map[i]].notary].bid_input[k][1]) % self.q == (self.notary[self.bidder[self.winner_bidder[j]].notary].bid_input[l][0] + self.notary[self.bidder[self.winner_bidder[j]].notary].bid_input[l][1]) % self.q:
                        flag = 1
                        break
                
                if flag == 1:
                    break
            
            if flag == 1:
                break
        
        if flag == 0:
            l:int128 = self.winners
            self.winner_bidder[l] = self.bidder_map[i]
            self.winners = self.winners + 1

@public
def winners_count() -> int128:
    log.Winners(self.winners)
    return self.winners


@public
def min_j2(idx: int128, ini: int128) -> bool:
    flag: int128 = 0
    for i in range(100):
        if i == idx:
            break
        if i != ini:
            for k in range(0, 10):
                if k == self.notary[self.bidder[self.bidder_map[idx]].notary].n:
                    break
                for l in range(0, 10):
                    if l == self.notary[self.bidder[self.bidder_map[i]].notary].n:
                        break
                    if (self.notary[self.bidder[self.bidder_map[idx]].notary].bid_input[k][0] + self.notary[self.bidder[self.bidder_map[idx]].notary].bid_input[k][1]) % self.q == (self.notary[self.bidder[self.bidder_map[i]].notary].bid_input[l][0] + self.notary[self.bidder[self.bidder_map[i]].notary].bid_input[l][1]) % self.q:
                        flag = 1
                        break
                
                if flag == 1:
                    break
            
            if flag == 1:
                break
    if flag == 1:
        return False
    else:
        return True
            

@public
def min_j(i: int128) -> int128:
    idx: int128 = 100
    for j in range(0,10):
        flag: int128 = 0
        if j >= i:
            if j == self.bidder_registered:
                break

            for k in range(0, 10):
                if k == self.notary[self.bidder[self.winner_bidder[i]].notary].n:
                    break
                for l in range(0, 10):
                    if l == self.notary[self.bidder[self.bidder_map[j]].notary].n:
                        break
                    if (self.notary[self.bidder[self.winner_bidder[i]].notary].bid_input[k][0] + self.notary[self.bidder[self.winner_bidder[i]].notary].bid_input[k][1]) % self.q != (self.notary[self.bidder[self.bidder_map[j]].notary].bid_input[l][0] + self.notary[self.bidder[self.bidder_map[j]].notary].bid_input[l][1]) % self.q:
                        flag = 1
                        break
                
                if flag == 1:
                    break
        
        if flag == 1:
            if self.min_j2(j, i) == True:
                idx = j
                break

    if idx != 100:
        return idx
    else:
        return -1
            

@public
def payment(i: int128) -> decimal:
    payment: decimal  
    j: int128 = self.min_j(i)
    if j == -1:
        payment = 0
    else:
        payment = convert((self.notary[self.bidder[self.bidder_map[j]].notary].bid_value[0] + self.notary[self.bidder[self.bidder_map[j]].notary].bid_value[1] ) % self.q, 'decimal')
        payment = payment / self.sqrt(self.notary[self.bidder[self.bidder_map[j]].notary].n)
        payment = payment * self.sqrt(self.notary[self.bidder[self.winner_bidder[i]].notary].n)

    return payment

@public
def get_winner_payments():
    assert block.timestamp >= self.auction_end

    for i in range(100):
        if i == self.winners:
            break

        self.bidder[self.winner_bidder[i]].payment -= self.payment(i) 

    self.winner_payments_calculated = True

@public
def pay_bidders():
    assert self.winner_payments_calculated
    assert not self.paid_bidders

    for i in range(100):
        if i == self.bidder_registered:
            break
        
        if self.bidder[self.bidder_map[i]].payment < 0.0:
            payment: wei_value = as_wei_value(-self.bidder[self.bidder_map[i]].payment, 'wei')
            send(self.bidder_map[i], payment)
        else:
            paid: wei_value = as_wei_value(self.bidder[self.bidder_map[i]].paid, 'wei')
            send(self.bidder_map[i], paid)

    self.paid_bidders = True

@public
def notary_payment():
    assert block.timestamp >= self.auction_end
    
    for i in range(100):
        if i == self.notary_registered:
            break
        self.notary[self.notary_map[i]].fees = self.c * self.notary[self.notary_map[i]].count

    self.notary_fees_calculated = True


@public
def pay_notary():
    assert self.notary_fees_calculated

    for i in range(100):
        if i == self.notary_registered:
            break

        fee: wei_value = as_wei_value(self.notary[self.notary_map[i]].fees, 'wei')
        send(self.notary_map[i], fee)










