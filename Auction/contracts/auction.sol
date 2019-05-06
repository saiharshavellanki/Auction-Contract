pragma solidity ^0.4.24;
contract Auction{

    uint public Q;
    uint public M;
    uint public Notary_Constant;
    uint public num_of_notaries = 0;
    uint public num_of_bidders = 0;
    address public Auctioneer;
    uint notary_register_time=2;
    uint bidder_register_time=4;

    struct Notary
    {
    uint value;
    bool is_taken;
    bool bidder_assigned;
    }

    struct Bidder
    {
    uint[2][] items;
    uint[2] w;
    address assigned_notary_address;
    bool is_taken;
    uint money;
    }


    mapping( address => Notary) public notaries;
    mapping( address => Bidder) public bidders;

    address[] public notary_addresses;
    address[] public bidder_addresses;
    uint unassigned_notary_index = 0;
    uint auction_start;

    //function which calculates square root of an integer
    function sqrt(uint x) returns (uint y) {
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    //checks whether q is prime or not
    function IsPrime(uint q) public returns(bool){
        uint i;
        uint s;
        s = sqrt(q);
        for(i=2;i<=s;i++){
        if(q%i==0)
            return false;
        }
        return true;
    }

    // Initialisation of a contract
    constructor(uint q,uint m,uint not_const) public
    {
        require(Auctioneer==0x0,"Auctioneer is already present");
        require(IsPrime(q)==true,"q is not prime");
        Q = q;
        M = m;
        Notary_Constant = not_const;
        Auctioneer = msg.sender;
        auction_start=now;
    }


    //Function to Register notaries in the contract
    function RegisterNotary() public
    {
        require(now>auction_start);
        require(now<=auction_start + notary_register_time * 1 hours);
        require(msg.sender != Auctioneer);
        require(notaries[msg.sender].is_taken==false);
        notaries[msg.sender] = Notary(0,true,false);
        notary_addresses.push(msg.sender);
        num_of_notaries++;
        uint rand_index = (uint256(keccak256(now, msg.sender, block.timestamp)) % num_of_notaries);
        address t;
        t = notary_addresses[rand_index];
        notary_addresses[rand_index] = notary_addresses[num_of_notaries-1];
        notary_addresses[num_of_notaries-1] = t;

    }


    //Function to register bidders in the contract
    function RegisterBidder(uint[2][] items,uint[2] w) public payable
    {

    //commenting the below 2 lines as time is taken by default as 2 hrs which is not possible during testing
    //    require(now>auction_start + notary_register_time * 1 hours);
    //    require(now<=auction_start + bidder_register_time * 1 hours);
        require(msg.sender != Auctioneer);
        require(notaries[msg.sender].is_taken==false);
        require(bidders[msg.sender].is_taken==false);
        require(num_of_bidders<num_of_notaries);
        require(msg.value >= (w[0]+w[1])%Q,"money is not sufficient");

        uint i;
        uint v;
        uint f = 0;
        for(i=0;i<items.length;i++)
        {
            v = (items[i][0]+items[i][1])%Q;
            if(v>M || v==0)
            {
                f=1;
                break;
            }
        }
        require(f==0,"Items must be in range [1,m]");
        bidders[msg.sender] = Bidder(items,w,notary_addresses[unassigned_notary_index] ,true,msg.value);
        bidder_addresses.push(msg.sender);
        notaries[notary_addresses[unassigned_notary_index]].bidder_assigned = true;
        unassigned_notary_index++;
        num_of_bidders++;
    }


    function random() private view returns (uint8)
    {
        return uint8(uint256(keccak256(block.timestamp, block.difficulty))%251);
    }


    //comparing ordered pairs (ui,vi),(uj,vj)
    function Compare(address first,address second) private returns (uint)
    {
        uint u1=bidders[first].w[0];
        uint v1=bidders[second].w[0];
        uint u2=bidders[first].w[1];
        uint v2=bidders[second].w[1];
        int n1;
        int n2;
        n1 = int(u1)-int(v1);
        n2 = int(u2)-int(v2);
        if(n1<0)
        {
            n1=-1*n1;
            n1=int(Q)-(n1%int(Q));
        }
        if(n2<0)
        {
            n2=-1*n2;
            n2=int(Q)-(n2%int(Q));
        }
        uint sum_mod=(uint(n1)+uint(n2))%Q;
        if(sum_mod==0)
        {
            return 0;
        }
        else if(sum_mod<(Q/2))
        {
            return 1;
        }
        else
        {
            return 2;
        }


    }
    address[] public winners;
    uint public winner_cnt=0;
    uint[] public money;
    mapping (address => uint ) winner_index;
    mapping (address => uint) notary_comparison;


    //checking intersection of 2 bidder's items
    function intersection(uint[2][] items1,uint[2][] items2) private returns (uint)
    {
        uint len1=items1.length;
        uint len2=items2.length;
        uint flag=0;
        uint i;
        uint m;
        uint n;
        uint s1;
        uint s2;
        for(i=0;i<len1;i++)
        {
            for(m=0;m<len2;m++)
            {
                s1 = (items1[i][0]+items1[i][1])%Q;
                s2 = (items2[m][0]+items2[m][1])%Q;
                if(s1==s2)
                {
                    flag=1;
                    break;
                }
            }
            if(flag==1)
            break;
        }
        return flag;

    }

    //Insertion sort based on wi values
    function insertion_sort() public
    {
        require(msg.sender==Auctioneer);
        uint len=bidder_addresses.length;
        uint i;
        uint m;
        uint n;
        uint k;
        uint j;
        address temp;
        for(i=0;i<len;i++)
        {
            notary_comparison[bidder_addresses[i]]=0;
        }
        for(i=1;i<len;i++)
        {
            j=i;
            for(m=i-1;m>=0;m--)
            {
                if(Compare(bidder_addresses[j],bidder_addresses[m])==1)
                {
                    temp=bidder_addresses[j];
                    bidder_addresses[j]=bidder_addresses[m];
                    bidder_addresses[m]=temp;
                    notary_comparison[bidders[bidder_addresses[j]].assigned_notary_address]+=Notary_Constant;
                    notary_comparison[bidders[bidder_addresses[m]].assigned_notary_address]+=Notary_Constant;
                    j--;
                }
                else
                {
                    notary_comparison[bidders[bidder_addresses[j]].assigned_notary_address]+=Notary_Constant;
                    notary_comparison[bidders[bidder_addresses[m]].assigned_notary_address]+=Notary_Constant;
                    break;
                }
                if(m==0)
                    break;
            }
        }
    }

    //Getting Winners
    function Winners_Selection() public
    {
        require(msg.sender==Auctioneer);
        uint i;
        uint m;
        uint n;
        uint k;
        uint s1;
        uint s2;
        uint len=bidder_addresses.length;
        uint[2][] items_assigned;
        for(i=0;i<len;i++)
        {
            uint itm_assgn_len=items_assigned.length;
            uint itm_curr_len=bidders[bidder_addresses[i]].items.length;
            uint flag=1;
            for(m=0;m<itm_curr_len;m++)
            {
                for(n=0;n<itm_assgn_len;n++)
                {
                    s1 = (bidders[bidder_addresses[i]].items[m][0] + bidders[bidder_addresses[i]].items[m][1]) %Q;
                    s2 = (items_assigned[n][0]+items_assigned[n][1])%Q;
                    if(s1==s2)
                    {
                        flag=0;
                        break;
                    }
                }
                if(flag==0)
                break;
            }
            if(flag==1)
            {
                for(m=0;m<itm_curr_len;m++)
                {
                    items_assigned.push(bidders[bidder_addresses[i]].items[m]);
                }
                winners.push(bidder_addresses[i]);
                winner_cnt++;
                winner_index[bidder_addresses[i]]=i;
            }
        }
    }

    //Getting money to be payed to winners
    function Winner_Payment() public
    {
        require(msg.sender==Auctioneer);
        uint i;
        uint m;
        uint n;
        uint k;
        uint flag;
        uint len=bidder_addresses.length;
        for(i=0;i<winner_cnt;i++)
        {
            uint value_found=0;
            for(m=0;m<len;m++)
            {
                flag=intersection(bidders[winners[i]].items,bidders[bidder_addresses[m]].items);
                if(flag==0)
                {
                continue;
                }
                else
                {
                    flag=0;
                    for(k=0;k<m;k++)
                    {
                        if(bidder_addresses[k]==winners[i])
                        {
                            continue;
                        }
                        flag=intersection(bidders[bidder_addresses[m]].items,bidders[bidder_addresses[k]].items);
                        if(flag==1)
                        {
                            break;
                        }
                    }
                    if(flag==0)
                    {
                        value_found=1;
                        uint w=(bidders[bidder_addresses[m]].w[0]+bidders[bidder_addresses[m]].w[1])%Q;
                        money.push(w*sqrt(bidders[bidder_addresses[i]].items.length));
                    }
                }
            if(value_found!=0)
                break;
            }
            if(value_found==0)
            {
                money.push(0);
            }
        }
    }

    //Transfering money to account
    function Transfer_Money() public{
        require(msg.sender==Auctioneer);
        uint i;
        for(i=0;i<winner_cnt;i++)
        {
            bidders[winners[i]].money-=money[i];
            winners[i].transfer(bidders[winners[i]].money);
            bidders[winners[i]].money=0;
        }
        uint len=notary_addresses.length;
        for(i=0;i<len;i++)
        {
            notary_addresses[i].transfer(notary_comparison[notary_addresses[i]]);
            notary_comparison[notary_addresses[i]]=0;
        }
    }
}
