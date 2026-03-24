// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgriInsurance {

    address public admin;
    address public oracle;

    constructor(address _oracle) {
        admin = msg.sender;
        oracle = _oracle;
    }

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
    event OracleUpdated(address newOracle);
    event ContractFunded(address funder, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Not oracle");
        _;
    }

    modifier validPolicy(uint256 _policyId) {
        require(_policyId > 0 && _policyId <= policyCounter, "Invalid policy");
        _;
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

        uint256 policyId = ++policyCounter;

        policies[policyId] = Policy({
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

        emit PolicyCreated(policyId, _farmer);
    }

    function payPremium(uint256 _policyId)
        external
        payable
        validPolicy(_policyId)
    {
        Policy storage policy = policies[_policyId];

        require(msg.sender == policy.farmer, "Not policy owner");
        require(policy.status == PolicyStatus.Created, "Policy not in Created state");
        require(msg.value == policy.premium, "Incorrect premium");

        policy.status = PolicyStatus.Active;

        emit PremiumPaid(_policyId, msg.value);
    }

    function updateRainfall(
        uint256 _policyId,
        uint256 _rainfall
    )
        external
        onlyOracle
        validPolicy(_policyId)
    {
        Policy storage policy = policies[_policyId];

        require(policy.status == PolicyStatus.Active, "Policy not active");
        require(policy.recordedRainfall == 0, "Rainfall already recorded");

        policy.recordedRainfall = _rainfall;

        emit RainfallUpdated(_policyId, _rainfall);

        if (_rainfall < policy.minRainfall || _rainfall > policy.maxRainfall) {

            policy.status = PolicyStatus.PaidOut;

            require(address(this).balance >= policy.insuredAmount, "Insufficient contract balance");

            (bool sent, ) = payable(policy.farmer).call{value: policy.insuredAmount}("");
            require(sent, "Payout failed");

            emit PayoutReleased(_policyId, policy.insuredAmount);
        }
    }

    function expirePolicy(uint256 _policyId)
        external
        onlyAdmin
        validPolicy(_policyId)
    {
        Policy storage policy = policies[_policyId];

        require(policy.status == PolicyStatus.Active, "Policy not active");
        require(block.timestamp > policy.seasonEnd, "Season not ended");

        policy.status = PolicyStatus.Expired;

        emit PolicyExpired(_policyId);
    }

    function setOracle(address _newOracle) external onlyAdmin {
        require(_newOracle != address(0), "Invalid oracle");
        oracle = _newOracle;

        emit OracleUpdated(_newOracle);
    }

    function fundContract() external payable onlyAdmin {
        require(msg.value > 0, "No funds sent");
        emit ContractFunded(msg.sender, msg.value);
    }

    function getPolicy(uint256 _policyId)
        external
        view
        validPolicy(_policyId)
        returns (Policy memory)
    {
        return policies[_policyId];
    }

    receive() external payable {
        emit ContractFunded(msg.sender, msg.value);
    }
}