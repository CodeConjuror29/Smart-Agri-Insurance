// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AgriInsurance {

    address public admin;
    address public oracle;

    enum PolicyStatus {
        Created,
        Active,
        PaidOut,
        Expired
    }

    struct Policy {
        address farmer;
        string crop;
        string location;
        uint256 seasonStart;
        uint256 seasonEnd;
        uint256 premium;
        uint256 insuredAmount;
        uint256 minRainfall;
        uint256 maxRainfall;
        uint256 recordedRainfall;
        PolicyStatus status;
    }

    uint256 public policyCounter;
    mapping(uint256 => Policy) public policies;

    event PolicyCreated(uint256 policyId, address farmer);
    event PremiumPaid(uint256 policyId, uint256 amount);
    event RainfallUpdated(uint256 policyId, uint256 rainfall);
    event PayoutReleased(uint256 policyId, uint256 amount);
    event PolicyExpired(uint256 policyId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Not oracle");
        _;
    }

    constructor(address _oracle) {
        admin = msg.sender;
        oracle = _oracle;
    }

    function createPolicy(
        address _farmer,
        string memory _crop,
        string memory _location,
        uint256 _seasonStart,
        uint256 _seasonEnd,
        uint256 _premium,
        uint256 _insuredAmount,
        uint256 _minRainfall,
        uint256 _maxRainfall
    ) external onlyAdmin {

        require(_minRainfall < _maxRainfall, "Invalid rainfall range");
        require(_seasonStart < _seasonEnd, "Invalid season duration");

        policyCounter++;

        policies[policyCounter] = Policy({
            farmer: _farmer,
            crop: _crop,
            location: _location,
            seasonStart: _seasonStart,
            seasonEnd: _seasonEnd,
            premium: _premium,
            insuredAmount: _insuredAmount,
            minRainfall: _minRainfall,
            maxRainfall: _maxRainfall,
            recordedRainfall: 0,
            status: PolicyStatus.Created
        });

        emit PolicyCreated(policyCounter, _farmer);
    }

    function payPremium(uint256 _policyId) external payable {
        Policy storage policy = policies[_policyId];

        require(policy.farmer == msg.sender, "Not policy owner");
        require(policy.status == PolicyStatus.Created, "Policy not in Created state");
        require(msg.value == policy.premium, "Incorrect premium");

        policy.status = PolicyStatus.Active;
        emit PremiumPaid(_policyId, msg.value);
    }

    function updateRainfall(uint256 _policyId, uint256 _rainfall)
        external
        onlyOracle
    {
        Policy storage policy = policies[_policyId];

        require(policy.status == PolicyStatus.Active, "Policy not active");

        policy.recordedRainfall = _rainfall;

        if (
            _rainfall < policy.minRainfall ||
            _rainfall > policy.maxRainfall
        ) {
            policy.status = PolicyStatus.PaidOut;
            payable(policy.farmer).transfer(policy.insuredAmount);
            emit PayoutReleased(_policyId, policy.insuredAmount);
        }

        emit RainfallUpdated(_policyId, _rainfall);
    }

    function expirePolicy(uint256 _policyId) external onlyAdmin {
        Policy storage policy = policies[_policyId];

        require(policy.status == PolicyStatus.Active, "Policy not active");
        require(block.timestamp > policy.seasonEnd, "Season not ended");

        policy.status = PolicyStatus.Expired;
        emit PolicyExpired(_policyId);
    }
}